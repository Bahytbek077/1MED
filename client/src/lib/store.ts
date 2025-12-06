import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, type SubscriptionWithSteps, type Role, type ServiceType } from './api';
import type { User, Service, Plan, Message, Step } from '@shared/schema';

export type { Role, ServiceType, User, Service, Plan, Message, Step, SubscriptionWithSteps };
export type Subscription = SubscriptionWithSteps;

interface StoreState {
  currentUser: User | null;
  users: User[];
  plans: Plan[];
  services: Service[];
  subscriptions: SubscriptionWithSteps[];
  messages: Message[];
  isLoading: boolean;
  
  loadData: () => Promise<void>;
  
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password?: string, role?: Role) => Promise<void>;
  
  addUser: (user: { name: string; email: string; password: string; role: string }) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  assignDoctorToPatient: (patientId: string, doctorId: string | null) => Promise<void>;

  subscribe: (userId: string, planId: string) => Promise<void>;
  sendMessage: (fromId: string, toId: string, content: string) => Promise<void>;
  
  updateStepStatus: (subId: string, stepId: string, status: 'pending' | 'completed') => Promise<void>;
  addStep: (subId: string, step: { title: string; description: string; type: string; serviceId?: string; date?: Date | null }) => Promise<void>;
  removeStep: (subId: string, stepId: string) => Promise<void>;
  updateStepDate: (subId: string, stepId: string, date: string) => Promise<void>;
  updateSubscriptionNotes: (subId: string, notes: string) => Promise<void>;
  
  toggleSubscription: (subId: string) => Promise<void>;
  updatePlan: (planId: string, data: Partial<Plan>) => Promise<void>;

  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      plans: [],
      services: [],
      subscriptions: [],
      messages: [],
      isLoading: false,

      loadData: async () => {
        set({ isLoading: true });
        try {
          const [users, plans, services, subscriptions, messages] = await Promise.all([
            api.users.getAll(),
            api.plans.getAll(),
            api.services.getAll(),
            api.subscriptions.getAll(),
            api.messages.getAll(),
          ]);
          set({ users, plans, services, subscriptions, messages, isLoading: false });
        } catch (error) {
          console.error('Failed to load data:', error);
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        try {
          const user = await api.auth.login(email, password || '');
          set({ currentUser: user });
          await get().loadData();
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      logout: () => set({ currentUser: null }),

      register: async (name, email, password, role = 'patient') => {
        try {
          const user = await api.auth.register({ name, email, password: password || '', role });
          set({ currentUser: user });
          await get().loadData();
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      addUser: async (userData) => {
        try {
          const newUser = await api.users.create(userData as any);
          set(state => ({ users: [...state.users, newUser] }));
        } catch (error) {
          console.error('Failed to add user:', error);
          throw error;
        }
      },

      updateUser: async (id, data) => {
        try {
          const updatedUser = await api.users.update(id, data);
          set(state => ({
            users: state.users.map(u => u.id === id ? updatedUser : u),
            currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser
          }));
        } catch (error) {
          console.error('Failed to update user:', error);
          throw error;
        }
      },

      deleteUser: async (id) => {
        try {
          await api.users.delete(id);
          set(state => ({
            users: state.users.filter(u => u.id !== id),
            subscriptions: state.subscriptions.filter(s => s.userId !== id)
          }));
        } catch (error) {
          console.error('Failed to delete user:', error);
          throw error;
        }
      },

      assignDoctorToPatient: async (patientId, doctorId) => {
        try {
          const updatedUser = await api.users.update(patientId, { doctorId });
          set(state => ({
            users: state.users.map(u => u.id === patientId ? updatedUser : u),
            currentUser: state.currentUser?.id === patientId ? updatedUser : state.currentUser
          }));
        } catch (error) {
          console.error('Failed to assign doctor:', error);
          throw error;
        }
      },

      subscribe: async (userId, planId) => {
        try {
          const existingActiveSub = get().subscriptions.find(s => s.userId === userId && s.status === 'active');
          
          if (existingActiveSub) {
            await api.subscriptions.update(existingActiveSub.id, { status: 'inactive' });
          }
          
          const newSub = await api.subscriptions.create({ userId, planId, status: 'active' });
          const plan = get().plans.find(p => p.id === planId);
          const services = get().services;
          
          const initialServiceIds = plan?.allowedServiceIds?.slice(0, 2) || [];
          for (const serviceId of initialServiceIds) {
            const svc = services.find(s => s.id === serviceId);
            if (svc) {
              await api.steps.create(newSub.id, {
                title: svc.name,
                description: 'Запланировано тарифом',
                type: svc.type,
                serviceId: svc.id,
                status: 'pending'
              });
            }
          }
          
          const fullSub = await api.subscriptions.get(newSub.id);
          set(state => ({ 
            subscriptions: state.subscriptions
              .map(s => s.id === existingActiveSub?.id ? { ...s, status: 'inactive' } : s)
              .concat([fullSub])
          }));
        } catch (error) {
          console.error('Failed to subscribe:', error);
          throw error;
        }
      },

      sendMessage: async (fromId, toId, content) => {
        try {
          const newMessage = await api.messages.send({ fromId, toId, content });
          set(state => ({ messages: [...state.messages, newMessage] }));
        } catch (error) {
          console.error('Failed to send message:', error);
          throw error;
        }
      },

      updateStepStatus: async (subId, stepId, status) => {
        try {
          await api.steps.update(stepId, { status });
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.id === subId
                ? { ...sub, route: sub.route.map(s => s.id === stepId ? { ...s, status } : s) }
                : sub
            )
          }));
        } catch (error) {
          console.error('Failed to update step status:', error);
          throw error;
        }
      },

      updateStepDate: async (subId, stepId, date) => {
        try {
          await api.steps.update(stepId, { date: new Date(date) } as any);
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.id === subId
                ? { ...sub, route: sub.route.map(s => s.id === stepId ? { ...s, date: new Date(date) } : s) }
                : sub
            )
          }));
        } catch (error) {
          console.error('Failed to update step date:', error);
          throw error;
        }
      },

      updateSubscriptionNotes: async (subId, notes) => {
        try {
          await api.subscriptions.update(subId, { doctorNotes: notes });
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.id === subId ? { ...sub, doctorNotes: notes } : sub
            )
          }));
        } catch (error) {
          console.error('Failed to update notes:', error);
          throw error;
        }
      },

      addStep: async (subId, step) => {
        try {
          const newStep = await api.steps.create(subId, step as any);
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.id === subId
                ? { ...sub, route: [...sub.route, newStep] }
                : sub
            )
          }));
        } catch (error) {
          console.error('Failed to add step:', error);
          throw error;
        }
      },

      removeStep: async (subId, stepId) => {
        try {
          await api.steps.delete(stepId);
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.id === subId
                ? { ...sub, route: sub.route.filter(s => s.id !== stepId) }
                : sub
            )
          }));
        } catch (error) {
          console.error('Failed to remove step:', error);
          throw error;
        }
      },

      toggleSubscription: async (subId) => {
        const sub = get().subscriptions.find(s => s.id === subId);
        if (!sub) return;
        const newStatus = sub.status === 'active' ? 'inactive' : 'active';
        try {
          await api.subscriptions.update(subId, { status: newStatus });
          set(state => ({
            subscriptions: state.subscriptions.map(s =>
              s.id === subId ? { ...s, status: newStatus } : s
            )
          }));
        } catch (error) {
          console.error('Failed to toggle subscription:', error);
          throw error;
        }
      },

      updatePlan: async (planId, data) => {
        try {
          await api.plans.update(planId, data);
          set(state => ({
            plans: state.plans.map(p => p.id === planId ? { ...p, ...data } : p)
          }));
        } catch (error) {
          console.error('Failed to update plan:', error);
          throw error;
        }
      },

      addService: async (serviceData) => {
        try {
          const newService = await api.services.create(serviceData as any);
          set(state => ({ services: [...state.services, newService] }));
        } catch (error) {
          console.error('Failed to add service:', error);
          throw error;
        }
      },

      updateService: async (id, data) => {
        try {
          await api.services.update(id, data);
          set(state => ({
            services: state.services.map(s => s.id === id ? { ...s, ...data } : s)
          }));
        } catch (error) {
          console.error('Failed to update service:', error);
          throw error;
        }
      },

      deleteService: async (id) => {
        try {
          await api.services.delete(id);
          set(state => ({
            services: state.services.filter(s => s.id !== id),
            plans: state.plans.map(p => ({
              ...p,
              allowedServiceIds: p.allowedServiceIds?.filter(sid => sid !== id) || []
            }))
          }));
        } catch (error) {
          console.error('Failed to delete service:', error);
          throw error;
        }
      },
    }),
    {
      name: '1med-storage-v5',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);

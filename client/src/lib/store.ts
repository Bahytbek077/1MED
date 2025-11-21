import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'patient' | 'doctor' | 'admin';
export type ServiceType = 'consultation' | 'test' | 'specialist';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[]; // Marketing text
  allowedServiceIds: string[]; // Logic restrictions
}

export interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  date?: string;
  type: ServiceType;
  serviceId?: string; // Link to the specific service
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  route: Step[];
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  plans: Plan[];
  services: Service[];
  subscriptions: Subscription[];
  messages: Message[];
  
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password?: string, role?: Role) => void;
  
  // User Management
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Patient Actions
  subscribe: (userId: string, planId: string) => void;
  sendMessage: (fromId: string, toId: string, content: string) => void;
  
  // Doctor Actions
  updateStepStatus: (subId: string, stepId: string, status: 'pending' | 'completed') => void;
  addStep: (subId: string, step: Omit<Step, 'id' | 'status'>) => void;
  removeStep: (subId: string, stepId: string) => void;
  
  // Admin Actions
  toggleSubscription: (subId: string) => void;
  updatePlan: (planId: string, data: Partial<Plan>) => void;
}

// Seed Data
const SEED_USERS: User[] = [
  { id: '1', name: 'Др. Хаус', email: 'doctor@1med.com', password: '123', role: 'doctor', avatar: 'https://i.pravatar.cc/150?u=doctor' },
  { id: '2', name: 'Алиса Петрова', email: 'patient@gmail.com', password: '123', role: 'patient', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { id: '3', name: 'Администратор', email: 'admin@1med.com', password: '123', role: 'admin' },
  { id: '4', name: 'Борис Иванов', email: 'bob@gmail.com', password: '123', role: 'patient', avatar: 'https://i.pravatar.cc/150?u=bob' },
];

const SEED_SERVICES: Service[] = [
  // Specialists
  { id: 'svc_therapist', name: 'Терапевт', type: 'consultation' },
  { id: 'svc_gastro', name: 'Гастроэнтеролог', type: 'specialist' },
  { id: 'svc_endo', name: 'Эндокринолог', type: 'specialist' },
  { id: 'svc_cardio', name: 'Кардиолог', type: 'specialist' },
  { id: 'svc_neuro', name: 'Невролог', type: 'specialist' },
  { id: 'svc_nutri', name: 'Нутрициолог', type: 'specialist' },
  
  // Tests
  { id: 'svc_oak', name: 'Общий анализ крови', type: 'test' },
  { id: 'svc_bio', name: 'Биохимия крови', type: 'test' },
  { id: 'svc_hormones', name: 'Гормональный профиль', type: 'test' },
  { id: 'svc_urine', name: 'Общий анализ мочи', type: 'test' },
  
  // Examinations
  { id: 'svc_us_abdomen', name: 'УЗИ брюшной полости', type: 'test' },
  { id: 'svc_mri', name: 'МРТ', type: 'test' },
  { id: 'svc_ecg', name: 'ЭКГ', type: 'test' },
];

const SEED_PLANS: Plan[] = [
  { 
    id: 'basic', 
    name: 'Базовый Чекап', 
    price: 2900, 
    description: 'Основной мониторинг здоровья',
    features: ['Консультация терапевта', 'Общий анализ крови', 'Звонок по результатам'],
    allowedServiceIds: ['svc_therapist', 'svc_oak', 'svc_urine']
  },
  { 
    id: 'standard', 
    name: 'Полное Здоровье', 
    price: 5900, 
    description: 'Комплексный анализ организма',
    features: ['2 консультации терапевта', 'Расширенная панель крови', 'Визит к кардиологу', 'УЗИ'],
    allowedServiceIds: ['svc_therapist', 'svc_oak', 'svc_bio', 'svc_cardio', 'svc_us_abdomen', 'svc_ecg']
  },
  { 
    id: 'premium', 
    name: 'Премиум Забота', 
    price: 12900, 
    description: 'Всесторонняя медицинская поддержка',
    features: ['Безлимитный чат', 'Полный чекап организма', 'Нутрициолог', 'Личный менеджер'],
    allowedServiceIds: ['svc_therapist', 'svc_gastro', 'svc_endo', 'svc_cardio', 'svc_neuro', 'svc_nutri', 'svc_oak', 'svc_bio', 'svc_hormones', 'svc_urine', 'svc_us_abdomen', 'svc_mri', 'svc_ecg']
  },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub1',
    userId: '2',
    planId: 'standard',
    status: 'active',
    startDate: '2024-05-01',
    route: [
      { id: 's1', title: 'Терапевт', description: 'Сбор анамнеза и жалоб', status: 'completed', type: 'consultation', date: '2024-05-02', serviceId: 'svc_therapist' },
      { id: 's2', title: 'Общий анализ крови', description: 'Сдается натощак', status: 'completed', type: 'test', date: '2024-05-05', serviceId: 'svc_oak' },
      { id: 's3', title: 'Кардиолог', description: 'Проверка сердечного ритма', status: 'pending', type: 'specialist', date: '2024-05-10', serviceId: 'svc_cardio' },
    ]
  }
];

const SEED_MESSAGES: Message[] = [
  { id: 'm1', fromId: '2', toId: '1', content: 'Здравствуйте, доктор Хаус. Когда лучше сдать кровь?', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm2', fromId: '1', toId: '2', content: 'Добрый день, Алиса. Желательно утром натощак, до 10:00.', timestamp: new Date(Date.now() - 80000000).toISOString() },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: SEED_USERS,
      plans: SEED_PLANS,
      services: SEED_SERVICES,
      subscriptions: SEED_SUBSCRIPTIONS,
      messages: SEED_MESSAGES,

      login: (email, password) => {
        const state = get();
        const user = state.users.find(u => u.email === email);
        if (user && user.password === password) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null }),

      register: (name, email, password, role = 'patient') => set((state) => {
        const newUser: User = { 
          id: Math.random().toString(36).substr(2, 9), 
          name, 
          email, 
          password, 
          role 
        };
        return { users: [...state.users, newUser], currentUser: newUser };
      }),

      addUser: (userData) => set((state) => {
        const newUser: User = { 
          ...userData,
          id: Math.random().toString(36).substr(2, 9), 
        };
        return { users: [...state.users, newUser] };
      }),

      updateUser: (id, data) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser
      })),

      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id),
        subscriptions: state.subscriptions.filter(s => s.userId !== id)
      })),

      subscribe: (userId, planId) => set((state) => {
        const plan = state.plans.find(p => p.id === planId);
        // Create initial route based on marketing features or just empty for doctor to fill?
        // For MVP let's add some basic steps based on allowedServices (taking first few)
        const initialServices = plan?.allowedServiceIds.slice(0, 2).map(id => state.services.find(s => s.id === id)).filter(Boolean) || [];
        
        const initialRoute: Step[] = initialServices.map(svc => ({
          id: Math.random().toString(36).substr(2, 9),
          title: svc!.name,
          description: 'Запланировано тарифом',
          status: 'pending',
          type: svc!.type,
          serviceId: svc!.id
        }));

        const newSub: Subscription = {
          id: Math.random().toString(36).substr(2, 9),
          userId,
          planId,
          status: 'active',
          startDate: new Date().toISOString(),
          route: initialRoute
        };
        return { subscriptions: [...state.subscriptions, newSub] };
      }),

      sendMessage: (fromId, toId, content) => set((state) => ({
        messages: [...state.messages, {
          id: Math.random().toString(36).substr(2, 9),
          fromId, toId, content, timestamp: new Date().toISOString()
        }]
      })),

      updateStepStatus: (subId, stepId, status) => set((state) => ({
        subscriptions: state.subscriptions.map(sub => 
          sub.id === subId 
            ? { ...sub, route: sub.route.map(s => s.id === stepId ? { ...s, status } : s) }
            : sub
        )
      })),

      addStep: (subId, step) => set((state) => ({
        subscriptions: state.subscriptions.map(sub => 
          sub.id === subId 
            ? { ...sub, route: [...sub.route, { ...step, id: Math.random().toString(36).substr(2, 9), status: 'pending' }] }
            : sub
        )
      })),

      removeStep: (subId, stepId) => set((state) => ({
        subscriptions: state.subscriptions.map(sub => 
          sub.id === subId 
            ? { ...sub, route: sub.route.filter(s => s.id !== stepId) }
            : sub
        )
      })),

      toggleSubscription: (subId) => set((state) => ({
        subscriptions: state.subscriptions.map(sub => 
          sub.id === subId 
            ? { ...sub, status: sub.status === 'active' ? 'inactive' : 'active' }
            : sub
        )
      })),

      updatePlan: (planId, data) => set((state) => ({
        plans: state.plans.map(p => p.id === planId ? { ...p, ...data } : p)
      })),
    }),
    {
      name: '1med-storage-v3', // Increment version to reset data structure
    }
  )
);

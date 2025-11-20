import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  date?: string;
  type: 'consultation' | 'test' | 'specialist';
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
  subscriptions: Subscription[];
  messages: Message[];
  
  login: (email: string) => void;
  logout: () => void;
  register: (name: string, email: string, role: Role) => void;
  
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
  { id: '1', name: 'Др. Хаус', email: 'doctor@1med.com', role: 'doctor', avatar: 'https://i.pravatar.cc/150?u=doctor' },
  { id: '2', name: 'Алиса Петрова', email: 'patient@gmail.com', role: 'patient', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { id: '3', name: 'Администратор', email: 'admin@1med.com', role: 'admin' },
  { id: '4', name: 'Борис Иванов', email: 'bob@gmail.com', role: 'patient', avatar: 'https://i.pravatar.cc/150?u=bob' },
];

const SEED_PLANS: Plan[] = [
  { 
    id: 'basic', 
    name: 'Базовый Чекап', 
    price: 2900, 
    description: 'Основной мониторинг здоровья',
    features: ['Консультация терапевта', 'Общий анализ крови', 'Звонок по результатам']
  },
  { 
    id: 'standard', 
    name: 'Полное Здоровье', 
    price: 5900, 
    description: 'Комплексный анализ организма',
    features: ['2 консультации терапевта', 'Расширенная панель крови', 'Визит к кардиологу', 'УЗИ']
  },
  { 
    id: 'premium', 
    name: 'Премиум Забота', 
    price: 12900, 
    description: 'Всесторонняя медицинская поддержка',
    features: ['Безлимитный чат', 'Полный чекап организма', 'Нутрициолог', 'Личный менеджер']
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
      { id: 's1', title: 'Первичная консультация терапевта', description: 'Сбор анамнеза и жалоб', status: 'completed', type: 'consultation', date: '2024-05-02' },
      { id: 's2', title: 'Общий анализ крови (ОАК)', description: 'Сдается натощак', status: 'completed', type: 'test', date: '2024-05-05' },
      { id: 's3', title: 'Прием кардиолога', description: 'Проверка сердечного ритма', status: 'pending', type: 'specialist', date: '2024-05-10' },
      { id: 's4', title: 'Итоговая консультация', description: 'Обсуждение результатов и план лечения', status: 'pending', type: 'consultation' },
    ]
  }
];

const SEED_MESSAGES: Message[] = [
  { id: 'm1', fromId: '2', toId: '1', content: 'Здравствуйте, доктор Хаус. Когда лучше сдать кровь?', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm2', fromId: '1', toId: '2', content: 'Добрый день, Алиса. Желательно утром натощак, до 10:00.', timestamp: new Date(Date.now() - 80000000).toISOString() },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: SEED_USERS,
      plans: SEED_PLANS,
      subscriptions: SEED_SUBSCRIPTIONS,
      messages: SEED_MESSAGES,

      login: (email) => set((state) => {
        const user = state.users.find(u => u.email === email);
        return { currentUser: user || null };
      }),

      logout: () => set({ currentUser: null }),

      register: (name, email, role) => set((state) => {
        const newUser: User = { id: Math.random().toString(36).substr(2, 9), name, email, role };
        return { users: [...state.users, newUser], currentUser: newUser };
      }),

      subscribe: (userId, planId) => set((state) => {
        const plan = state.plans.find(p => p.id === planId);
        const initialRoute: Step[] = plan?.features.map((f, i) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: f,
          description: 'Запланированный этап',
          status: 'pending',
          type: i === 0 ? 'consultation' : 'test' // simplified logic
        })) || [];

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
      name: '1med-storage',
    }
  )
);

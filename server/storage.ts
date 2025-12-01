import { eq, and, or, desc, asc } from "drizzle-orm";
import { db } from "./db";
import {
  users, services, plans, subscriptions, steps, messages,
  type User, type InsertUser,
  type Service, type InsertService,
  type Plan, type InsertPlan,
  type Subscription, type InsertSubscription, type SubscriptionWithSteps,
  type Step, type InsertStep,
  type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  getPlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: string, data: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<void>;

  getSubscriptions(): Promise<SubscriptionWithSteps[]>;
  getSubscription(id: string): Promise<SubscriptionWithSteps | undefined>;
  getSubscriptionsByUser(userId: string): Promise<SubscriptionWithSteps[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<void>;

  getStepsBySubscription(subscriptionId: string): Promise<Step[]>;
  createStep(step: InsertStep): Promise<Step>;
  updateStep(id: string, data: Partial<InsertStep>): Promise<Step | undefined>;
  deleteStep(id: string): Promise<void>;

  getMessages(): Promise<Message[]>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getPlans(): Promise<Plan[]> {
    return db.select().from(plans);
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }

  async updatePlan(id: string, data: Partial<InsertPlan>): Promise<Plan | undefined> {
    const [updated] = await db.update(plans).set(data).where(eq(plans.id, id)).returning();
    return updated;
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  async getSubscriptions(): Promise<SubscriptionWithSteps[]> {
    const subs = await db.select().from(subscriptions);
    const result: SubscriptionWithSteps[] = [];
    for (const sub of subs) {
      const route = await db.select().from(steps)
        .where(eq(steps.subscriptionId, sub.id))
        .orderBy(asc(steps.sortOrder));
      result.push({ ...sub, route });
    }
    return result;
  }

  async getSubscription(id: string): Promise<SubscriptionWithSteps | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    if (!sub) return undefined;
    const route = await db.select().from(steps)
      .where(eq(steps.subscriptionId, id))
      .orderBy(asc(steps.sortOrder));
    return { ...sub, route };
  }

  async getSubscriptionsByUser(userId: string): Promise<SubscriptionWithSteps[]> {
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    const result: SubscriptionWithSteps[] = [];
    for (const sub of subs) {
      const route = await db.select().from(steps)
        .where(eq(steps.subscriptionId, sub.id))
        .orderBy(asc(steps.sortOrder));
      result.push({ ...sub, route });
    }
    return result;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db.insert(subscriptions).values(subscription).returning();
    return newSub;
  }

  async updateSubscription(id: string, data: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getStepsBySubscription(subscriptionId: string): Promise<Step[]> {
    return db.select().from(steps)
      .where(eq(steps.subscriptionId, subscriptionId))
      .orderBy(asc(steps.sortOrder));
  }

  async createStep(step: InsertStep): Promise<Step> {
    const [newStep] = await db.insert(steps).values(step).returning();
    return newStep;
  }

  async updateStep(id: string, data: Partial<InsertStep>): Promise<Step | undefined> {
    const [updated] = await db.update(steps).set(data).where(eq(steps.id, id)).returning();
    return updated;
  }

  async deleteStep(id: string): Promise<void> {
    await db.delete(steps).where(eq(steps.id, id));
  }

  async getMessages(): Promise<Message[]> {
    return db.select().from(messages).orderBy(asc(messages.timestamp));
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(
        or(
          and(eq(messages.fromId, userId1), eq(messages.toId, userId2)),
          and(eq(messages.fromId, userId2), eq(messages.toId, userId1))
        )
      )
      .orderBy(asc(messages.timestamp));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async seedInitialData(): Promise<void> {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) return;

    const seedServices = [
      { id: 'svc_therapist', name: 'Терапевт', type: 'consultation' },
      { id: 'svc_gastro', name: 'Гастроэнтеролог', type: 'specialist' },
      { id: 'svc_endo', name: 'Эндокринолог', type: 'specialist' },
      { id: 'svc_cardio', name: 'Кардиолог', type: 'specialist' },
      { id: 'svc_neuro', name: 'Невролог', type: 'specialist' },
      { id: 'svc_nutri', name: 'Нутрициолог', type: 'specialist' },
      { id: 'svc_oak', name: 'Общий анализ крови', type: 'test' },
      { id: 'svc_bio', name: 'Биохимия крови', type: 'test' },
      { id: 'svc_hormones', name: 'Гормональный профиль', type: 'test' },
      { id: 'svc_urine', name: 'Общий анализ мочи', type: 'test' },
      { id: 'svc_us_abdomen', name: 'УЗИ брюшной полости', type: 'test' },
      { id: 'svc_mri', name: 'МРТ', type: 'test' },
      { id: 'svc_ecg', name: 'ЭКГ', type: 'test' },
    ];
    await db.insert(services).values(seedServices);

    const seedPlans = [
      { 
        id: 'basic', 
        name: 'Базовый Чекап', 
        price: 14500, 
        description: 'Основной мониторинг здоровья',
        features: ['Консультация терапевта', 'Общий анализ крови', 'Звонок по результатам'],
        allowedServiceIds: ['svc_therapist', 'svc_oak', 'svc_urine']
      },
      { 
        id: 'standard', 
        name: 'Полное Здоровье', 
        price: 29500, 
        description: 'Комплексный анализ организма',
        features: ['2 консультации терапевта', 'Расширенная панель крови', 'Визит к кардиологу', 'УЗИ'],
        allowedServiceIds: ['svc_therapist', 'svc_oak', 'svc_bio', 'svc_cardio', 'svc_us_abdomen', 'svc_ecg']
      },
      { 
        id: 'premium', 
        name: 'Премиум Забота', 
        price: 64500, 
        description: 'Всесторонняя медицинская поддержка',
        features: ['Безлимитный чат', 'Полный чекап организма', 'Нутрициолог', 'Личный менеджер'],
        allowedServiceIds: ['svc_therapist', 'svc_gastro', 'svc_endo', 'svc_cardio', 'svc_neuro', 'svc_nutri', 'svc_oak', 'svc_bio', 'svc_hormones', 'svc_urine', 'svc_us_abdomen', 'svc_mri', 'svc_ecg']
      },
    ];
    await db.insert(plans).values(seedPlans);

    const seedUsers = [
      { 
        id: '1', 
        name: 'Др. Хаус', 
        email: 'doctor@1med.com', 
        password: '123', 
        role: 'doctor', 
        avatar: 'https://i.pravatar.cc/150?u=doctor',
        specialization: 'Терапевт-диагност',
        experience: 15,
        phone: '+7 (999) 123-45-67',
        bio: 'Специализируюсь на сложных диагностических случаях. Люблю загадки.'
      },
      { id: '2', name: 'Алиса Петрова', email: 'patient@gmail.com', password: '123', role: 'patient', avatar: 'https://i.pravatar.cc/150?u=alice' },
      { id: '3', name: 'Администратор', email: 'admin@1med.com', password: '123', role: 'admin' },
      { id: '4', name: 'Борис Иванов', email: 'bob@gmail.com', password: '123', role: 'patient', avatar: 'https://i.pravatar.cc/150?u=bob' },
    ];
    await db.insert(users).values(seedUsers);

    const seedSubscription = {
      id: 'sub1',
      userId: '2',
      planId: 'standard',
      status: 'active',
      doctorNotes: 'Пациент жалуется на утомляемость. Рекомендую проверить уровень железа и витамина D.',
    };
    await db.insert(subscriptions).values(seedSubscription);

    const seedSteps = [
      { subscriptionId: 'sub1', title: 'Терапевт', description: 'Сбор анамнеза и жалоб', status: 'completed', type: 'consultation', date: new Date('2024-05-02'), serviceId: 'svc_therapist', sortOrder: 0 },
      { subscriptionId: 'sub1', title: 'Общий анализ крови', description: 'Сдается натощак', status: 'completed', type: 'test', date: new Date('2024-05-05'), serviceId: 'svc_oak', sortOrder: 1 },
      { subscriptionId: 'sub1', title: 'Кардиолог', description: 'Проверка сердечного ритма', status: 'pending', type: 'specialist', date: new Date('2024-05-10'), serviceId: 'svc_cardio', sortOrder: 2 },
    ];
    await db.insert(steps).values(seedSteps);

    const seedMessages = [
      { fromId: '2', toId: '1', content: 'Здравствуйте, доктор Хаус. Когда лучше сдать кровь?' },
      { fromId: '1', toId: '2', content: 'Добрый день, Алиса. Желательно утром натощак, до 10:00.' },
    ];
    await db.insert(messages).values(seedMessages);
  }
}

export const storage = new DatabaseStorage();

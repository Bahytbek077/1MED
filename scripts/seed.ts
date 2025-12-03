import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

const pgHost = process.env.PGHOST;
const pgDatabase = process.env.PGDATABASE;
const pgUser = process.env.PGUSER;
const pgPassword = process.env.PGPASSWORD;
const pgPort = process.env.PGPORT || '5432';

if (!pgHost || !pgDatabase || !pgUser || !pgPassword) {
  console.error('Missing PostgreSQL environment variables');
  process.exit(1);
}

const connectionString = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const pool = new Pool({ connectionString });
const db = drizzle({ client: pool, schema });

async function seed() {
  console.log('Starting seed...');

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

  console.log('Adding services...');
  for (const service of seedServices) {
    try {
      await db.insert(schema.services).values(service).onConflictDoNothing();
    } catch (e) {
      console.log(`Service ${service.id} may already exist`);
    }
  }

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

  console.log('Adding plans...');
  for (const plan of seedPlans) {
    try {
      await db.insert(schema.plans).values(plan).onConflictDoNothing();
    } catch (e) {
      console.log(`Plan ${plan.id} may already exist`);
    }
  }

  const seedUsers = [
    {
      id: 'admin_1',
      email: 'admin@1med.com',
      password: '123',
      name: 'Администратор',
      role: 'admin' as const,
    },
    {
      id: 'doctor_1',
      email: 'doctor@1med.com',
      password: '123',
      name: 'Доктор Иванов',
      role: 'doctor' as const,
      specialization: 'Терапевт',
      phone: '+7 (777) 123-4567',
    },
    {
      id: 'patient_1',
      email: 'patient@gmail.com',
      password: '123',
      name: 'Пациент Петров',
      role: 'patient' as const,
      dateOfBirth: '1990-05-15',
      phone: '+7 (777) 987-6543',
      doctorId: 'doctor_1',
    },
  ];

  console.log('Adding users...');
  for (const user of seedUsers) {
    try {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    } catch (e) {
      console.log(`User ${user.email} may already exist`);
    }
  }

  console.log('Seed completed!');
  await pool.end();
}

seed().catch(console.error);

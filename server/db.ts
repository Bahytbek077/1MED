import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;
let dbInitialized = false;
let dbError: string | null = null;

function initializeDatabase() {
  if (dbInitialized) return;
  dbInitialized = true;

  let connectionString = process.env.DATABASE_URL;
  
  // If DATABASE_URL contains unreachable host, try to build from PG* variables
  if (!connectionString || connectionString.includes('supabase.co')) {
    const pgHost = process.env.PGHOST;
    const pgDatabase = process.env.PGDATABASE;
    const pgUser = process.env.PGUSER;
    const pgPassword = process.env.PGPASSWORD;
    const pgPort = process.env.PGPORT || '5432';
    
    if (pgHost && pgDatabase && pgUser && pgPassword) {
      connectionString = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;
      console.log('Using Replit PostgreSQL connection');
    }
  }
  
  if (!connectionString) {
    dbError = "DATABASE_URL is not set and PG* variables are missing";
    console.error("Warning: Database connection not configured");
    return;
  }

  if (connectionString.includes('helium') && process.env.NODE_ENV === 'production') {
    dbError = "Internal hostname 'helium' cannot be used in production. Please set DATABASE_URL to the external Neon connection string.";
    console.error("Warning:", dbError);
    return;
  }

  try {
    neonConfig.webSocketConstructor = ws;
    neonConfig.useSecureWebSocket = true;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;

    pool = new Pool({ 
      connectionString,
      connectionTimeoutMillis: 15000,
      max: 10,
    });

    pool.on('error', (err) => {
      console.error('Database pool error:', err.message);
    });

    db = drizzle({ client: pool, schema });
    console.log('Database initialized');
  } catch (err) {
    dbError = (err as Error).message;
    console.error('Failed to initialize database:', dbError);
  }
}

initializeDatabase();

export function getDb() {
  if (!db) {
    throw new Error(dbError || 'Database not initialized');
  }
  return db;
}

export function getPool() {
  if (!pool) {
    throw new Error(dbError || 'Database pool not initialized');
  }
  return pool;
}

export function isDatabaseAvailable(): boolean {
  return db !== null && pool !== null;
}

export function getDatabaseError(): string | null {
  return dbError;
}

export async function testConnection(): Promise<boolean> {
  if (!pool) {
    console.log('Database pool not available');
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection test failed:', (err as Error).message);
    return false;
  }
}

export { db, pool };

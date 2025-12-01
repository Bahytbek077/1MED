import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

let connectionString = process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && process.env.DATABASE_URL_EXTERNAL) {
  connectionString = process.env.DATABASE_URL_EXTERNAL;
}

export const pool = new Pool({ 
  connectionString,
  connectionTimeoutMillis: 15000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

export const db = drizzle({ client: pool, schema });

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
}

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;

// Database is optional for local development
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn('DATABASE_URL not set - running with in-memory storage');
}

export { db };

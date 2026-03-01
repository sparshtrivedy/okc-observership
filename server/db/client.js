import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Add it to your environment or .env file.');
}

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

export const db = {
  query: (sql, params = []) => dbPool.query(sql, params)
};

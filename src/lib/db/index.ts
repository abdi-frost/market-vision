import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

declare global {
  // eslint-disable-next-line no-var
  var __mv_sql: postgres.Sql | undefined;
}

const sql = global.__mv_sql ??
  postgres(DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__mv_sql = sql;
}

export const db = drizzle(sql, { schema });

import mysql from 'mysql2/promise';
import type { Env } from './core-utils';
let pool: mysql.Pool | null = null;
export function getDb(env: Env) {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}
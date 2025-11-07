import { createPool, type Pool, type Connection } from 'mysql2/promise';
import type { Env } from './core-utils';
let pool: Pool | null = null;

function getPool(env: Env): Pool {
  if (!pool) {
    pool = createPool({
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

export async function getDbConnection(env: Env): Promise<Connection> {
  const pool = getPool(env);
  return pool.getConnection();
}
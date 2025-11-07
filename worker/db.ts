import { Client, type Connection } from '@planetscale/database';
import type { Env } from './core-utils';

let client: Client | null = null;

function getClient(env: Env): Client {
  if (!client) {
    client = new Client({
      host: `${env.DB_HOST}/${env.DB_NAME}`,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
    });
  }
  return client;
}

export function getDbConnection(env: Env): Connection {
  const client = getClient(env);
  return client.connection();
}
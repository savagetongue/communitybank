import type { ApiResponse } from "@shared/types";
import type { Context } from "hono";
export interface Env {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string
  DB_NAME: string;
  WORKER_API_KEY: string;
}
// API HELPERS
export const ok = <T>(c: Context, data: T) => c.json({ success: true, data } as ApiResponse<T>);
export const bad = (c: Context, error: string) => c.json({ success: false, error } as ApiResponse, 400);
export const notFound = (c: Context, error = 'not found') => c.json({ success: false, error } as ApiResponse, 404);
export const unauthorized = (c: Context, error = 'unauthorized') => c.json({ success: false, error } as ApiResponse, 401);
export const forbidden = (c: Context, error = 'forbidden') => c.json({ success: false, error } as ApiResponse, 403);
export const isStr = (s: unknown): s is string => typeof s === 'string' && s.length > 0;
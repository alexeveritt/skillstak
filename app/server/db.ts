import type { Env } from "./types";
import type { AppLoadContext } from "react-router";
import { getEnv } from "./adapter";

export const q = async <T>(env: Env | undefined, sql: string, bind: unknown[] = []) => {
  if (!env?.SKILLSTAK_DB) {
    throw new Response("Database not available", { status: 503 });
  }
  const res = await env.SKILLSTAK_DB.prepare(sql)
    .bind(...bind)
    .all<T>();
  return res.results as T[];
};

export const run = async (env: Env | undefined, sql: string, bind: unknown[] = []) => {
  if (!env?.SKILLSTAK_DB) {
    throw new Response("Database not available", { status: 503 });
  }
  await env.SKILLSTAK_DB.prepare(sql)
    .bind(...bind)
    .run();
};

// Helper to get env from context - works in both Node and Cloudflare
export const getEnvFromContext = (context: AppLoadContext): Env => {
  return getEnv(context);
};

// Safely get env from context, returns undefined if not available
export const getEnvSafe = (context: AppLoadContext): Env | undefined => {
  try {
    return getEnv(context);
  } catch {
    return undefined;
  }
};

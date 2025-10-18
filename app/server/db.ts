import type { Env } from "./types";

export const q = async <T>(env: Env | undefined, sql: string, bind: unknown[] = []) => {
  if (!env?.SKILLSTAK_DB) {
    throw new Response("Database not available. Please run with 'npm run dev:wrangler'", { status: 503 });
  }
  const res = await env.SKILLSTAK_DB.prepare(sql)
    .bind(...bind)
    .all<T>();
  return res.results as T[];
};

export const run = async (env: Env | undefined, sql: string, bind: unknown[] = []) => {
  if (!env?.SKILLSTAK_DB) {
    throw new Response("Database not available. Please run with 'npm run dev:wrangler'", { status: 503 });
  }
  await env.SKILLSTAK_DB.prepare(sql)
    .bind(...bind)
    .run();
};

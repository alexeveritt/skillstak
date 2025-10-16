import type { Env } from "./types";

export const q = async <T>(env: Env, sql: string, bind: unknown[] = []) => {
  const res = await env.SPACED_DB.prepare(sql)
    .bind(...bind)
    .all<T>();
  return res.results as T[];
};

export const run = async (env: Env, sql: string, bind: unknown[] = []) => {
  await env.SPACED_DB.prepare(sql)
    .bind(...bind)
    .run();
};

import type { Env } from "./types";
import { run, q } from "./db";
import { ulid } from "ulidx";

// Use Web Crypto API which is available in Cloudflare Workers
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPasswordHash(hash: string, password: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return hash === passwordHash;
}

export async function findUserByEmail(env: Env, email: string) {
  const rows = await q<{ id: string; email: string }>(env, "SELECT id, email FROM user WHERE email = ?", [email]);
  return rows[0] ?? null;
}

export async function createUserWithPassword(env: Env, email: string, password: string) {
  const userId = ulid();
  const hash = await hashPassword(password);
  await run(env, "INSERT INTO user (id, email) VALUES (?, ?)", [userId, email]);
  await run(env, "INSERT INTO auth_key (id, user_id, hashed_password) VALUES (?, ?, ?)", [
    `email:${email.toLowerCase()}`,
    userId,
    hash,
  ]);
  return { id: userId, email };
}

export async function verifyPassword(env: Env, email: string, password: string) {
  const key = await q<{ user_id: string; hashed_password: string }>(
    env,
    "SELECT user_id, hashed_password FROM auth_key WHERE id = ?",
    [`email:${email.toLowerCase()}`]
  );
  if (!key[0]?.hashed_password) return null;
  const ok = await verifyPasswordHash(key[0].hashed_password, password);
  return ok ? key[0].user_id : null;
}

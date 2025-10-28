// app/repositories/user.repository.ts

import { q, run } from "../server/db";
import type { Env } from "../server/types";

export type User = {
  id: string;
  email: string;
  email_verified_at?: string;
  created_at?: string;
};

export type AuthKey = {
  id: string;
  user_id: string;
  hashed_password: string;
};

export async function findUserById(env: Env, userId: string): Promise<User | null> {
  const rows = await q<User>(env, "SELECT id, email, email_verified_at, created_at FROM user WHERE id = ?", [userId]);
  return rows[0] ?? null;
}

export async function findUserByEmail(env: Env, email: string): Promise<User | null> {
  const rows = await q<User>(env, "SELECT id, email, email_verified_at, created_at FROM user WHERE email = ?", [email]);
  return rows[0] ?? null;
}

export async function createUser(env: Env, id: string, email: string): Promise<void> {
  await run(env, "INSERT INTO user (id, email) VALUES (?, ?)", [id, email]);
}

export async function findAuthKeyByEmail(env: Env, email: string): Promise<AuthKey | null> {
  const rows = await q<AuthKey>(env, "SELECT id, user_id, hashed_password FROM auth_key WHERE id = ?", [
    `email:${email.toLowerCase()}`,
  ]);
  return rows[0] ?? null;
}

export async function createAuthKey(env: Env, email: string, userId: string, hashedPassword: string): Promise<void> {
  await run(env, "INSERT INTO auth_key (id, user_id, hashed_password) VALUES (?, ?, ?)", [
    `email:${email.toLowerCase()}`,
    userId,
    hashedPassword,
  ]);
}

export async function updateAuthKeyPassword(env: Env, userId: string, hashedPassword: string): Promise<void> {
  await run(env, "UPDATE auth_key SET hashed_password = ? WHERE user_id = ? AND id LIKE 'email:%'", [
    hashedPassword,
    userId,
  ]);
}

// app/services/auth.service.ts

import { ulid } from "ulidx";
import * as userRepo from "../repositories/user.repository";
import type { Env } from "../server/types";

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

export async function signup(env: Env, email: string, password: string): Promise<{ id: string; email: string }> {
  const userId = ulid();
  const hash = await hashPassword(password);

  await userRepo.createUser(env, userId, email);
  await userRepo.createAuthKey(env, email, userId, hash);

  return { id: userId, email };
}

export async function login(env: Env, email: string, password: string): Promise<string | null> {
  const authKey = await userRepo.findAuthKeyByEmail(env, email);

  if (!authKey?.hashed_password) {
    return null;
  }

  const isValid = await verifyPasswordHash(authKey.hashed_password, password);
  return isValid ? authKey.user_id : null;
}

export async function checkUserExists(env: Env, email: string): Promise<boolean> {
  const user = await userRepo.findUserByEmail(env, email);
  return user !== null;
}

export async function resetPassword(env: Env, userId: string, newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword);
  await userRepo.updateAuthKeyPassword(env, userId, hash);
}

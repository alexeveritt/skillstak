import type { Env } from "./types";
import * as authService from "../services/auth.service";
import * as userRepo from "../repositories/user.repository";

export async function findUserByEmail(env: Env, email: string) {
  return await userRepo.findUserByEmail(env, email);
}

export async function createUserWithPassword(env: Env, email: string, password: string) {
  return await authService.signup(env, email, password);
}

export async function verifyPassword(env: Env, email: string, password: string) {
  return await authService.login(env, email, password);
}

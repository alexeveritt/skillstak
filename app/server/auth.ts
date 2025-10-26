import * as userRepo from "../repositories/user.repository";
import * as authService from "../services/auth.service";
import type { Env } from "./types";

export async function findUserByEmail(env: Env, email: string) {
  return await userRepo.findUserByEmail(env, email);
}

export async function createUserWithPassword(env: Env, email: string, password: string) {
  return await authService.signup(env, email, password);
}

export async function verifyPassword(env: Env, email: string, password: string) {
  return await authService.login(env, email, password);
}

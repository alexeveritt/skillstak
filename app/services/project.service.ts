// app/services/project.service.ts
import type { Env } from "../server/types";
import * as projectRepo from "../repositories/project.repository";
import * as cardRepo from "../repositories/card.repository";
import { newId } from "../lib/id";

export type ProjectWithStats = {
  id: string;
  name: string;
  total: number;
  due: number;
};

export async function listProjects(env: Env, userId: string): Promise<ProjectWithStats[]> {
  return await projectRepo.findProjectsByUserId(env, userId);
}

export async function getProject(env: Env, projectId: string, userId: string) {
  return await projectRepo.findProjectById(env, projectId, userId);
}

export async function createProject(
  env: Env,
  userId: string,
  name: string,
  color?: string,
  foregroundColor?: string
): Promise<string> {
  const id = newId();
  await projectRepo.createProject(env, id, userId, name, color || null, foregroundColor || null);
  return id;
}

export async function updateProject(
  env: Env,
  projectId: string,
  userId: string,
  name: string,
  color?: string,
  foregroundColor?: string
): Promise<void> {
  await projectRepo.updateProject(env, projectId, userId, name, color || null, foregroundColor || null);
}

export async function deleteProject(env: Env, projectId: string, userId: string): Promise<void> {
  // Delete all cards first (cascade)
  await cardRepo.deleteCardsByProjectId(env, projectId);
  await projectRepo.deleteProject(env, projectId, userId);
}

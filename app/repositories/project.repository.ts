// app/repositories/project.repository.ts
import type { Env } from "../server/types";
import { q, run } from "../server/db";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at?: string;
};

export type ProjectWithStats = {
  id: string;
  name: string;
  color: string | null;
  total: number;
  due: number;
};

export async function findProjectById(env: Env, projectId: string, userId: string): Promise<Project | null> {
  const rows = await q<Project>(
    env,
    "SELECT id, user_id, name, color, created_at FROM project WHERE id = ? AND user_id = ?",
    [projectId, userId]
  );
  return rows[0] ?? null;
}

export async function findProjectsByUserId(env: Env, userId: string): Promise<ProjectWithStats[]> {
  return await q<ProjectWithStats>(
    env,
    `SELECT p.id, p.name, p.color,
            (SELECT COUNT(*) FROM card c WHERE c.project_id = p.id) AS total,
            (SELECT COUNT(*) FROM card c JOIN card_schedule s ON s.card_id=c.id WHERE c.project_id = p.id AND s.due_at <= datetime('now')) AS due
     FROM project p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [userId]
  );
}

export async function createProject(
  env: Env,
  id: string,
  userId: string,
  name: string,
  color: string | null
): Promise<void> {
  await run(env, "INSERT INTO project (id, user_id, name, color) VALUES (?, ?, ?, ?)", [id, userId, name, color]);
}

export async function updateProject(
  env: Env,
  projectId: string,
  userId: string,
  name: string,
  color: string | null
): Promise<void> {
  await run(env, "UPDATE project SET name = ?, color = ? WHERE id = ? AND user_id = ?", [
    name,
    color,
    projectId,
    userId,
  ]);
}

export async function deleteProject(env: Env, projectId: string, userId: string): Promise<void> {
  await run(env, "DELETE FROM project WHERE id = ? AND user_id = ?", [projectId, userId]);
}

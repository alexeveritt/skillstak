// app/repositories/card.repository.ts
import type { Env } from "../server/types";
import { q, run } from "../server/db";

export type Card = {
  id: string;
  project_id: string;
  front: string;
  back: string;
  created_at?: string;
};

export type CardWithSchedule = {
  id: string;
  front: string;
  back: string;
  interval_days: number;
  ease: number;
  streak: number;
  lapses: number;
};

export async function findCardsByProjectId(env: Env, projectId: string): Promise<Card[]> {
  return await q<Card>(
    env,
    "SELECT id, project_id, front, back, created_at FROM card WHERE project_id = ? ORDER BY created_at DESC",
    [projectId]
  );
}

export async function findCardById(env: Env, cardId: string, projectId: string): Promise<Card | null> {
  const rows = await q<Card>(
    env,
    "SELECT id, project_id, front, back, created_at FROM card WHERE id = ? AND project_id = ?",
    [cardId, projectId]
  );
  return rows[0] ?? null;
}

export async function createCard(env: Env, id: string, projectId: string, front: string, back: string): Promise<void> {
  await run(env, "INSERT INTO card (id, project_id, front, back) VALUES (?, ?, ?, ?)", [id, projectId, front, back]);
}

export async function updateCard(
  env: Env,
  cardId: string,
  projectId: string,
  front: string,
  back: string
): Promise<void> {
  await run(env, "UPDATE card SET front = ?, back = ? WHERE id = ? AND project_id = ?", [
    front,
    back,
    cardId,
    projectId,
  ]);
}

export async function deleteCard(env: Env, cardId: string, projectId: string): Promise<void> {
  await run(env, "DELETE FROM card WHERE id = ? AND project_id = ?", [cardId, projectId]);
}

export async function deleteCardsByProjectId(env: Env, projectId: string): Promise<void> {
  await run(env, "DELETE FROM card WHERE project_id = ?", [projectId]);
}

export async function verifyCardOwnership(
  env: Env,
  cardId: string,
  projectId: string,
  userId: string
): Promise<boolean> {
  const rows = await q<{ ok: number }>(
    env,
    `SELECT COUNT(*) AS ok
     FROM project p
     JOIN card c ON c.project_id = p.id
     WHERE p.id = ? AND p.user_id = ? AND c.id = ?`,
    [projectId, userId, cardId]
  );
  return (rows[0]?.ok ?? 0) > 0;
}

export async function findNextDueCard(env: Env, projectId: string, userId: string): Promise<CardWithSchedule | null> {
  const rows = await q<CardWithSchedule>(
    env,
    `SELECT c.id, c.front, c.back, s.interval_days, s.ease, s.streak, s.lapses
    FROM card c
    JOIN project p ON p.id = c.project_id
    JOIN card_schedule s ON s.card_id = c.id
    WHERE p.user_id = ? AND p.id = ? AND s.due_at <= datetime('now')
    ORDER BY s.due_at LIMIT 1`,
    [userId, projectId]
  );
  return rows[0] ?? null;
}

export async function findCardSchedule(
  env: Env,
  cardId: string
): Promise<{
  interval_days: number;
  ease: number;
  streak: number;
  lapses: number;
  back: string;
} | null> {
  const rows = await q<{ interval_days: number; ease: number; streak: number; lapses: number; back: string }>(
    env,
    "SELECT interval_days, ease, streak, lapses, back FROM card c JOIN card_schedule s ON s.card_id=c.id WHERE c.id=?",
    [cardId]
  );
  return rows[0] ?? null;
}

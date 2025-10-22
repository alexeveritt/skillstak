// app/repositories/card-schedule.repository.ts
import type { Env } from "../server/types";
import { run } from "../server/db";

export type CardSchedule = {
  card_id: string;
  due_at: string;
  interval_days: number;
  ease: number;
  streak: number;
  lapses: number;
};

export async function createCardSchedule(env: Env, cardId: string, dueAt: string): Promise<void> {
  await run(
    env,
    "INSERT INTO card_schedule (card_id, due_at, interval_days, ease, streak, lapses) VALUES (?, ?, 0, 2.5, 0, 0)",
    [cardId, dueAt]
  );
}

export async function updateCardSchedule(
  env: Env,
  cardId: string,
  dueAt: string,
  intervalDays: number,
  ease: number,
  streak: number,
  lapses: number
): Promise<void> {
  await run(
    env,
    `UPDATE card_schedule SET due_at = ?, interval_days = ?, ease = ?, streak = ?, lapses = ? WHERE card_id = ?`,
    [dueAt, intervalDays, ease, streak, lapses, cardId]
  );
}

export async function deleteCardSchedule(env: Env, cardId: string): Promise<void> {
  await run(env, "DELETE FROM card_schedule WHERE card_id = ?", [cardId]);
}

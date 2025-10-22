// app/services/review.service.ts
import type { Env } from "../server/types";
import * as cardRepo from "../repositories/card.repository";
import * as scheduleRepo from "../repositories/card-schedule.repository";
import { addDaysIso, addMinutesIso } from "../lib/time";
import { dist, normalize } from "../lib/levenshtein";

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  interval_days: number;
  ease: number;
  streak: number;
  lapses: number;
};

export type ReviewResult = "again" | "good" | "type";

export async function getNextDueCard(env: Env, projectId: string, userId: string): Promise<ReviewCard | null> {
  return await cardRepo.findNextDueCard(env, projectId, userId);
}

export async function getRandomCardForPractice(env: Env, projectId: string, userId: string): Promise<ReviewCard | null> {
  return await cardRepo.findRandomCardForPractice(env, projectId, userId);
}

export async function getRandomCardsForPracticeSession(env: Env, projectId: string, userId: string, limit: number = 10): Promise<ReviewCard[]> {
  return await cardRepo.findRandomCardsForPracticeSession(env, projectId, userId, limit);
}

export async function getProjectStats(env: Env, projectId: string, userId: string) {
  return await cardRepo.getProjectStats(env, projectId, userId);
}

export async function reviewCardAgain(env: Env, cardId: string, isPracticeMode = false): Promise<void> {
  const schedule = await cardRepo.findCardSchedule(env, cardId);
  if (!schedule) return;

  const newLapses = schedule.lapses + 1;
  const newEase = Math.max(1.3, schedule.ease - 0.2);

  await scheduleRepo.updateCardSchedule(
    env,
    cardId,
    addMinutesIso(10), // due in 10 minutes
    0, // reset interval
    newEase,
    0, // reset streak
    newLapses
  );
}

export async function reviewCardGood(env: Env, cardId: string, isPracticeMode = false): Promise<void> {
  const schedule = await cardRepo.findCardSchedule(env, cardId);
  if (!schedule) return;

  // In practice mode, only update cards that aren't well-learned (streak < 5)
  // OR update failed cards (lapses > 0) positively
  if (isPracticeMode && schedule.streak >= 5 && schedule.lapses === 0) {
    // Don't update well-learned cards in practice mode
    return;
  }

  const newStreak = schedule.streak + 1;
  const newInterval = schedule.interval_days === 0 ? 1 : Math.round(schedule.interval_days * schedule.ease);
  const newEase = Math.min(3.0, schedule.ease + 0.05);

  await scheduleRepo.updateCardSchedule(
    env,
    cardId,
    addDaysIso(newInterval),
    newInterval,
    newEase,
    newStreak,
    schedule.lapses
  );
}

export async function reviewCardWithTypedAnswer(env: Env, cardId: string, answer: string, isPracticeMode = false): Promise<boolean> {
  const schedule = await cardRepo.findCardSchedule(env, cardId);
  if (!schedule) return false;

  const inputNormalized = normalize(answer);
  const targetNormalized = normalize(schedule.back);

  // Calculate allowed error based on length
  const allowedDistance = targetNormalized.length <= 5 ? 0 : targetNormalized.length <= 15 ? 1 : 2;
  const isCorrect = inputNormalized === targetNormalized || dist(inputNormalized, targetNormalized) <= allowedDistance;

  if (isCorrect) {
    await reviewCardGood(env, cardId, isPracticeMode);
  } else {
    await reviewCardAgain(env, cardId, isPracticeMode);
  }

  return isCorrect;
}

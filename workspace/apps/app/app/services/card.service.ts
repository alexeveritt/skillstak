// app/services/card.service.ts

import { newId } from "../lib/id";
import { nowIso } from "../lib/time";
import * as cardRepo from "../repositories/card.repository";
import * as scheduleRepo from "../repositories/card-schedule.repository";
import type { Env } from "../server/types";

export type Card = {
  id: string;
  front: string;
  back: string;
};

export async function listCards(env: Env, projectId: string): Promise<Card[]> {
  return await cardRepo.findCardsByProjectId(env, projectId);
}

export async function getCard(env: Env, cardId: string, projectId: string): Promise<Card | null> {
  return await cardRepo.findCardById(env, cardId, projectId);
}

export async function createCard(env: Env, projectId: string, front: string, back: string): Promise<string> {
  const id = newId();
  await cardRepo.createCard(env, id, projectId, front, back);

  // Initialize schedule
  await scheduleRepo.createCardSchedule(env, id, nowIso());

  return id;
}

export async function updateCard(
  env: Env,
  cardId: string,
  projectId: string,
  front: string,
  back: string
): Promise<void> {
  await cardRepo.updateCard(env, cardId, projectId, front, back);
}

export async function deleteCard(env: Env, cardId: string, projectId: string): Promise<void> {
  // Delete schedule first (FK constraint)
  await scheduleRepo.deleteCardSchedule(env, cardId);
  await cardRepo.deleteCard(env, cardId, projectId);
}

export async function verifyCardOwnership(
  env: Env,
  cardId: string,
  projectId: string,
  userId: string
): Promise<boolean> {
  return await cardRepo.verifyCardOwnership(env, cardId, projectId, userId);
}

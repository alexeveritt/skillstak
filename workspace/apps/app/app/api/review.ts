// app/api/review.ts
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { dist, normalize } from "../lib/levenshtein";
import { addDaysIso, addMinutesIso } from "../lib/time";
import { q, run } from "../server/db";
import { requireUserId } from "../server/session";

/**
 * GET /api/review?projectId=...
 *  - returns the next due card (or null)
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400 });

  const card =
    (
      await q<any>(
        context.cloudflare.env,
        `SELECT c.id, c.front, c.back, c.color, s.interval_days, s.ease, s.streak, s.lapses
           FROM card c
           JOIN project p ON p.id = c.project_id
           JOIN card_schedule s ON s.card_id = c.id
          WHERE p.user_id = ? AND p.id = ? AND s.due_at <= datetime('now')
          ORDER BY s.due_at
          LIMIT 1`,
        [userId, projectId]
      )
    )[0] ?? null;

  return new Response(JSON.stringify({ card }), { headers: { "content-type": "application/json" } });
}

async function scheduleAgain(env: any, cardId: string) {
  await run(
    env,
    `UPDATE card_schedule 
        SET streak=0, lapses=lapses+1, ease = MAX(1.3, ease - 0.2), interval_days=0, due_at=? 
      WHERE card_id=?`,
    [addMinutesIso(10), cardId]
  );
}

async function scheduleGood(env: any, cardId: string, intervalDays: number, ease: number, streak: number) {
  const newStreak = streak + 1;
  const newInterval = intervalDays === 0 ? 1 : Math.round(intervalDays * ease);
  const newEase = Math.min(3.0, ease + 0.05);
  await run(
    env,
    `UPDATE card_schedule 
        SET streak=?, interval_days=?, ease=?, due_at=? 
      WHERE card_id=?`,
    [newStreak, newInterval, newEase, addDaysIso(newInterval), cardId]
  );
}

/**
 * POST /api/review
 *  body:
 *   - self-mark: { cardId: string, result: "again" | "good" }
 *   - typed:     { cardId: string, result: "type", answer: string }
 */
export async function action({ context, request }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  await requireUserId({ request, cloudflare: context.cloudflare }); // ownership enforced by card lookup

  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const body = await request.json().catch(() => ({}));
  const { cardId, result } = body ?? {};
  if (!cardId || !result) {
    return new Response(JSON.stringify({ error: "cardId and result required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const c =
    (
      await q<any>(
        env,
        "SELECT c.back, s.interval_days, s.ease, s.streak FROM card c JOIN card_schedule s ON s.card_id=c.id WHERE c.id=?",
        [cardId]
      )
    )[0] ?? null;
  if (!c) return new Response("Not Found", { status: 404 });

  if (result === "again") {
    await scheduleAgain(env, cardId);
  } else if (result === "good") {
    await scheduleGood(env, cardId, c.interval_days, c.ease, c.streak);
  } else if (result === "type") {
    const input = normalize(String(body.answer ?? ""));
    const target = normalize(String(c.back ?? ""));
    const allow = target.length <= 5 ? 0 : target.length <= 15 ? 1 : 2;
    const ok = input === target || dist(input, target) <= allow;
    if (ok) await scheduleGood(env, cardId, c.interval_days, c.ease, c.streak);
    else await scheduleAgain(env, cardId);
  } else {
    return new Response(JSON.stringify({ error: "Invalid result" }), { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
}

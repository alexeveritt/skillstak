// app/api/cards.ts
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { requireUserId } from "../server/session";
import { q, run } from "../server/db";
import { cardSchema } from "../lib/z";
import { ulid } from "ulidx";
import { nowIso } from "../lib/time";

/**
 * GET /api/cards?projectId=...
 *  - list cards in a project (ownership checked)
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400 });

  // ownership check
  const owns = await q<{ ok: number }>(
    context.cloudflare.env,
    "SELECT COUNT(*) ok FROM project WHERE id = ? AND user_id = ?",
    [projectId, userId]
  );
  if (!owns[0]?.ok) return new Response("Not Found", { status: 404 });

  const cards = await q<{ id: string; front: string; back: string; color: string | null }>(
    context.cloudflare.env,
    "SELECT id, front, back, color FROM card WHERE project_id = ? ORDER BY created_at DESC",
    [projectId]
  );

  return new Response(JSON.stringify({ cards }), { headers: { "content-type": "application/json" } });
}

/**
 * POST /api/cards
 *  body: { projectId: string, front: string, back: string, color?: string }
 *  - create a card + seed schedule
 */
export async function action({ context, request }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await request.json().catch(() => ({}));
  const { projectId, ...rest } = body ?? {};
  if (!projectId) {
    return new Response(JSON.stringify({ error: "projectId required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // ownership check
  const owns = await q<{ ok: number }>(
    context.cloudflare.env,
    "SELECT COUNT(*) ok FROM project WHERE id = ? AND user_id = ?",
    [projectId, userId]
  );
  if (!owns[0]?.ok) return new Response("Not Found", { status: 404 });

  const parsed = cardSchema.safeParse(rest);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid card payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const id = ulid();
  await run(
    context.cloudflare.env,
    "INSERT INTO card (id, project_id, front, back, color) VALUES (?, ?, ?, ?, ?)",
    [id, projectId, parsed.data.front, parsed.data.back, parsed.data.color ?? null]
  );
  await run(
    context.cloudflare.env,
    "INSERT INTO card_schedule (card_id, due_at, interval_days, ease, streak, lapses) VALUES (?, ?, 0, 2.5, 0, 0)",
    [id, nowIso()]
  );

  return new Response(JSON.stringify({ id }), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}

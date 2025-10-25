// app/api/projects.ts
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { ulid } from "ulidx";
import { projectSchema } from "../lib/z";
import { q, run } from "../server/db";
import { requireUserId } from "../server/session";

/**
 * GET /api/project
 *  - returns all projects for the current user with simple counts
 */
export async function loader({ context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const rows = await q<{ id: string; name: string; total: number; due: number }>(
    context.cloudflare.env,
    `SELECT p.id, p.name,
            (SELECT COUNT(*) FROM card c WHERE c.project_id = p.id) AS total,
            (SELECT COUNT(*) FROM card c 
               JOIN card_schedule s ON s.card_id=c.id 
              WHERE c.project_id = p.id AND s.due_at <= datetime('now')) AS due
       FROM project p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
    [userId]
  );

  return new Response(JSON.stringify({ projects: rows }), {
    headers: { "content-type": "application/json" },
  });
}

/**
 * POST /api/projects
 *  body: { name: string }
 *  - creates a new project for the current user
 */
export async function action({ context, request }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid project name" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const id = ulid();
  await run(context.cloudflare.env, "INSERT INTO project (id, user_id, name) VALUES (?, ?, ?)", [
    id,
    userId,
    parsed.data.name,
  ]);

  return new Response(JSON.stringify({ id, name: parsed.data.name }), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}

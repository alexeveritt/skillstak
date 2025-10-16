// app/routes/_index.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import { q, run } from "../server/db";
import { projectSchema } from "../lib/z";
import { newId } from "../lib/id";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projects = await q<{ id: string; name: string; total: number; due: number }>(
    context.cloudflare.env,
    `SELECT p.id, p.name,
            (SELECT COUNT(*) FROM card c WHERE c.project_id = p.id) AS total,
            (SELECT COUNT(*) FROM card c JOIN card_schedule s ON s.card_id=c.id WHERE c.project_id = p.id AND s.due_at <= datetime('now')) AS due
     FROM project p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [userId]
  );
  return { projects };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const form = await request.formData();
  const name = String(form.get("name") || "");
  const parsed = projectSchema.safeParse({ name });
  if (!parsed.success) return { error: "Enter a name" };
  const id = newId();
  await run(context.cloudflare.env, "INSERT INTO project (id, user_id, name) VALUES (?, ?, ?)", [id, userId, name]);
  return null;
}

export default function Home() {
  const { projects } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your projects</h1>
      <Form method="post" className="flex gap-2 mb-4">
        <input name="name" placeholder="New project" className="border p-2 rounded flex-1" />
        <button className="bg-black text-white rounded px-4">Add</button>
      </Form>
      <ul className="grid gap-3">
        {projects.map((p) => (
          <li key={p.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <Link to={`/p/${p.id}`} className="font-medium underline">
                {p.name}
              </Link>
              <div className="text-sm text-slate-600">
                {p.due} due · {p.total} cards
              </div>
            </div>
            <Link to={`/p/${p.id}/review`} className="text-sm underline">
              Practice
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

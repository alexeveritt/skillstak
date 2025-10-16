// app/routes/p.$projectId._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import { q } from "../server/db";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const [project] = await q<{ id: string; name: string }>(
    context.cloudflare.env,
    "SELECT id, name FROM project WHERE id = ? AND user_id = ?",
    [projectId, userId]
  );
  const cards = await q<{ id: string; front: string; back: string; color: string | null }>(
    context.cloudflare.env,
    "SELECT id, front, back, color FROM card WHERE project_id = ? ORDER BY created_at DESC",
    [projectId]
  );
  return { project, cards };
}

export default function ProjectDetail() {
  const { project, cards } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-3">{project?.name}</h1>
      <div className="flex gap-2 mb-3">
        <Link to="cards/new" className="underline">
          Add card
        </Link>
        <Link to="review" className="underline">
          Practice
        </Link>
      </div>
      <ul className="grid gap-3">
        {cards.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <div className="text-sm text-slate-600">{c.color || "#fef3c7"}</div>
            <div className="font-medium">{c.front}</div>
            <div className="text-slate-700">{c.back}</div>
            <Link to={`cards/${c.id}/edit`} className="text-sm underline">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

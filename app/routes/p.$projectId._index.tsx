// app/routes/p.$projectId._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import * as projectService from "../services/project.service";
import * as cardService from "../services/card.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);
  const cards = await cardService.listCards(context.cloudflare.env, projectId);

  return { project, cards };
}

export default function ProjectDetail() {
  const { project, cards } = useLoaderData<typeof loader>();
  const projectColor = project?.color || "#fef3c7";

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-2xl font-semibold">{project?.name}</h1>
        {project?.color && (
          <span
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: projectColor }}
          ></span>
        )}
      </div>
      <div className="flex gap-2 mb-3">
        <Link to="cards/new" className="underline">
          Add card
        </Link>
        <Link to="review" className="underline">
          Practice
        </Link>
        <Link to="edit" className="underline">
          Edit Project
        </Link>
      </div>
      <ul className="grid gap-3">
        {cards.map((c) => (
          <li key={c.id} className="border rounded p-3" style={{ backgroundColor: projectColor }}>
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

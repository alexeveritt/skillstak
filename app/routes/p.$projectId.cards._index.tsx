// app/routes/p.$projectId.cards._index.tsx
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

export default function CardsList() {
  const { project, cards } = useLoaderData<typeof loader>();
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={`/p/${project?.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Project"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: projectForegroundColor }}>
            {project?.name} - Cards
          </h1>
          {project?.color && (
            <span
              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: projectColor }}
            ></span>
          )}
        </div>

        <Link
          to="new"
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
        >
          ➕ Add Card
        </Link>
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 mb-4">No cards yet! Add your first card to get started.</p>
            <Link
              to="new"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              ➕ Add First Card
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">All Cards ({cards.length})</h2>
            </div>
            <ul className="grid gap-3">
              {cards.map((c) => (
                <li
                  key={c.id}
                  className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{
                    borderColor: projectColor,
                    backgroundColor: `${projectColor}20`,
                  }}
                >
                  <div className="font-semibold text-gray-800 mb-1">{c.front}</div>
                  <div className="text-gray-600 text-sm mb-2">{c.back}</div>
                  <Link
                    to={`${c.id}/edit`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: projectForegroundColor }}
                  >
                    ✏️ Edit
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}


// app/routes/p.$projectId.cards._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useMatches } from "react-router";
import { requireUserId } from "../server/session";
import * as cardService from "../services/card.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const cards = await cardService.listCards(context.cloudflare.env, projectId);

  return { cards };
}

export default function CardsList() {
  const { cards } = useLoaderData<typeof loader>();
  const matches = useMatches();
  // Find the layout route data
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  return (
    <>
      {/* Action Button */}
      <div className="flex justify-end mb-6">
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
    </>
  );
}

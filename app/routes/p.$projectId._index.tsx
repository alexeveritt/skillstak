// app/routes/p.$projectId._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import * as projectService from "../services/project.service";
import * as cardService from "../services/card.service";
import * as reviewService from "../services/review.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);
  const cards = await cardService.listCards(context.cloudflare.env, projectId);
  const stats = await reviewService.getProjectStats(context.cloudflare.env, projectId, userId);

  return { project, cards, stats };
}

export default function ProjectDetail() {
  const { project, cards, stats } = useLoaderData<typeof loader>();
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold" style={{ color: projectForegroundColor }}>
          {project?.name}
        </h1>
        {project?.color && (
          <span
            className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: projectColor }}
          ></span>
        )}
      </div>

      {/* Stats Dashboard */}
      {stats && stats.total_cards > 0 && (
        <div className="mb-8 space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className="rounded-xl p-5 shadow-md"
              style={{
                backgroundColor: projectColor,
                color: projectForegroundColor,
              }}
            >
              <div className="text-3xl font-bold">{stats.total_cards}</div>
              <div className="text-sm font-medium mt-1 opacity-80">📚 Total Cards</div>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-5 shadow-md">
              <div className="text-3xl font-bold text-red-700">{stats.due_now}</div>
              <div className="text-sm font-medium text-red-600 mt-1">🔥 Ready Now</div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-5 shadow-md">
              <div className="text-3xl font-bold text-green-700">{stats.mastered_cards}</div>
              <div className="text-sm font-medium text-green-600 mt-1">⭐ Mastered</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-5 shadow-md">
              <div className="text-3xl font-bold text-yellow-700">{stats.learning_cards}</div>
              <div className="text-sm font-medium text-yellow-600 mt-1">📖 Learning</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-5 shadow-md">
            <div className="text-sm font-semibold text-gray-700 mb-3">Your Progress</div>
            <div className="flex items-center gap-2 h-8 bg-gray-200 rounded-full overflow-hidden">
              {stats.mastered_cards > 0 && (
                <div
                  className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(stats.mastered_cards / stats.total_cards) * 100}%` }}
                >
                  {stats.mastered_cards > 0 && Math.round((stats.mastered_cards / stats.total_cards) * 100) > 10 && `${Math.round((stats.mastered_cards / stats.total_cards) * 100)}%`}
                </div>
              )}
              {stats.learning_cards > 0 && (
                <div
                  className="bg-yellow-400 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(stats.learning_cards / stats.total_cards) * 100}%` }}
                >
                  {stats.learning_cards > 0 && Math.round((stats.learning_cards / stats.total_cards) * 100) > 10 && `${Math.round((stats.learning_cards / stats.total_cards) * 100)}%`}
                </div>
              )}
              {stats.new_cards > 0 && (
                <div
                  className="bg-purple-400 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(stats.new_cards / stats.total_cards) * 100}%` }}
                >
                  {stats.new_cards > 0 && Math.round((stats.new_cards / stats.total_cards) * 100) > 10 && `${Math.round((stats.new_cards / stats.total_cards) * 100)}%`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Mastered</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-gray-600">Learning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-400 rounded"></div>
                <span className="text-gray-600">New</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {stats && stats.due_now > 0 ? (
          <Link
            to="review"
            className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            🚀 Start Review ({stats.due_now})
          </Link>
        ) : (
          <Link
            to="review?mode=practice"
            className="flex-1 min-w-[200px] bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            🎮 Practice Mode
          </Link>
        )}

        <Link
          to="cards/new"
          className="flex-1 min-w-[200px] bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          ➕ Add Card
        </Link>
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">All Cards</h2>
          <Link to="edit" className="text-sm text-gray-600 hover:text-gray-800 underline">
            Edit Project
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 mb-4">No cards yet! Add your first card to get started.</p>
            <Link
              to="cards/new"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              ➕ Add First Card
            </Link>
          </div>
        ) : (
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
                  to={`cards/${c.id}/edit`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: projectForegroundColor }}
                >
                  ✏️ Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

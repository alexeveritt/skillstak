// app/routes/p.$projectId._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import * as projectService from "../services/project.service";
import * as reviewService from "../services/review.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);
  const stats = await reviewService.getProjectStats(context.cloudflare.env, projectId, userId);

  return { project, stats };
}

export default function ProjectDetail() {
  const { project, stats } = useLoaderData<typeof loader>();
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
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

        {/* Edit Menu */}
        <div className="relative group">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <Link
              to="edit"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
            >
              ✏️ Edit Project
            </Link>
            <Link
              to="cards"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
            >
              📚 View Cards List
            </Link>
          </div>
        </div>
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

      {/* Empty State when no cards */}
      {stats && stats.total_cards === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
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
        </div>
      )}
    </div>
  );
}

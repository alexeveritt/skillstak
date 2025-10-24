// app/routes/p.$projectId._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useMatches } from "react-router";
import { requireUserId } from "../server/session";
import * as reviewService from "../services/review.service";
import { Edit, Library, MoreVertical } from "lucide-react";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const stats = await reviewService.getProjectStats(context.cloudflare.env, projectId, userId);

  return { stats };
}

function formatNextReviewTime(nextDueAt: string | null): string | null {
  if (!nextDueAt) return null;

  // SQLite returns datetime in format 'YYYY-MM-DD HH:MM:SS' (UTC)
  // We need to handle it properly whether it has a 'Z' suffix or not
  let dueDate: Date;

  try {
    if (nextDueAt.endsWith("Z")) {
      dueDate = new Date(nextDueAt);
    } else if (nextDueAt.includes("T")) {
      // ISO format without Z
      dueDate = new Date(nextDueAt + "Z");
    } else {
      // SQLite format 'YYYY-MM-DD HH:MM:SS' - replace space with T and add Z
      dueDate = new Date(nextDueAt.replace(" ", "T") + "Z");
    }

    // Check if date is valid
    if (isNaN(dueDate.getTime())) {
      console.error("Invalid date format:", nextDueAt);
      return null;
    }
  } catch (error) {
    console.error("Error parsing date:", nextDueAt, error);
    return null;
  }

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();

  // If the difference is negative or very small (less than 1 minute), don't show a time
  // This means cards should be due now, which is a data inconsistency
  if (diffMs < 60000) {
    return null;
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  } else if (diffDays === 1) {
    return "tomorrow";
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else {
    const weeks = Math.floor(diffDays / 7);
    return `in ${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
}

export default function ProjectDetail() {
  const { stats } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  return (
    <>
      {/* Header with Edit Menu - Only on main project page */}
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
            <MoreVertical className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <Link
              to="edit"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Project
            </Link>
            <Link
              to="cards"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg transition-colors"
            >
              <Library className="w-4 h-4" />
              Manage Cards
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
                  {stats.mastered_cards > 0 &&
                    Math.round((stats.mastered_cards / stats.total_cards) * 100) > 10 &&
                    `${Math.round((stats.mastered_cards / stats.total_cards) * 100)}%`}
                </div>
              )}
              {stats.learning_cards > 0 && (
                <div
                  className="bg-yellow-400 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(stats.learning_cards / stats.total_cards) * 100}%` }}
                >
                  {stats.learning_cards > 0 &&
                    Math.round((stats.learning_cards / stats.total_cards) * 100) > 10 &&
                    `${Math.round((stats.learning_cards / stats.total_cards) * 100)}%`}
                </div>
              )}
              {stats.new_cards > 0 && (
                <div
                  className="bg-purple-400 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ width: `${(stats.new_cards / stats.total_cards) * 100}%` }}
                >
                  {stats.new_cards > 0 &&
                    Math.round((stats.new_cards / stats.total_cards) * 100) > 10 &&
                    `${Math.round((stats.new_cards / stats.total_cards) * 100)}%`}
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
      <div className="space-y-4 mb-6">
        {stats && stats.due_now > 0 ? (
          <>
            {/* Spaced Repetition Review */}
            <Link
              to="review"
              className="block bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">Start Review Session</span>
                  </div>
                  <div className="text-sm opacity-90">
                    {stats.due_now} card{stats.due_now !== 1 ? "s" : ""} ready for spaced repetition review
                  </div>
                </div>
                <div className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg shadow-md flex-shrink-0 hover:bg-blue-50 transition-colors">
                  Start
                </div>
              </div>
            </Link>

            {/* Practice Mode */}
            <Link
              to="review?mode=practice"
              className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-lg font-bold mb-2">Practice Mode</div>
                  <div className="text-xs opacity-90">
                    Review any cards without affecting your spaced repetition schedule
                  </div>
                </div>
                <div className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg shadow-md flex-shrink-0 hover:bg-purple-50 transition-colors">
                  Start
                </div>
              </div>
            </Link>
          </>
        ) : (
          <>
            {/* No cards due - show next review time */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-lg font-bold text-gray-700 mb-2">All Caught Up!</div>
              <div className="text-sm text-gray-600">
                {(() => {
                  const nextReviewTime = formatNextReviewTime(stats?.next_due_at ?? null);
                  if (nextReviewTime) {
                    return (
                      <>
                        No cards are due for review right now. Your next review will be{" "}
                        <strong>{nextReviewTime}</strong>.
                      </>
                    );
                  } else if (stats?.next_due_at) {
                    return <>You're all done for now. Come back later to review more cards.</>;
                  } else {
                    return <>You have no cards scheduled for review yet.</>;
                  }
                })()}
              </div>
            </div>

            {/* Practice Mode */}
            <Link
              to="review?mode=practice"
              className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-lg font-bold mb-2">Practice Mode</div>
                  <div className="text-sm opacity-90">
                    Review any cards for fun without affecting your spaced repetition schedule
                  </div>
                </div>
                <div className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg shadow-md flex-shrink-0 hover:bg-purple-50 transition-colors">
                  Start
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Empty State when no cards */}
      {stats && stats.total_cards === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 mb-4">No cards yet! Get started by adding your first card.</p>
            <Link
              to="cards"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              📚 Go to Cards List
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

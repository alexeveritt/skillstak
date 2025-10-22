// app/routes/p.$projectId.review.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useLoaderData, useActionData, useSearchParams, Link } from "react-router";
import { requireUserId } from "../server/session";
import { CardFlip } from "../components/CardFlip";
import * as reviewService from "../services/review.service";
import * as projectService from "../services/project.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "review"; // "review" or "practice"

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);
  const stats = await reviewService.getProjectStats(context.cloudflare.env, projectId, userId);

  let card = null;
  if (mode === "practice") {
    card = await reviewService.getRandomCardForPractice(context.cloudflare.env, projectId, userId);
  } else {
    card = await reviewService.getNextDueCard(context.cloudflare.env, projectId, userId);
  }

  return { card, project, stats, mode };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const fd = await request.formData();
  const cardId = String(fd.get("cardId"));
  const result = String(fd.get("result")); // again|good|type
  const mode = String(fd.get("mode") || "review");
  const isPracticeMode = mode === "practice";
  const env = context.cloudflare.env;

  if (result === "again") {
    await reviewService.reviewCardAgain(env, cardId, isPracticeMode);
  } else if (result === "good") {
    await reviewService.reviewCardGood(env, cardId, isPracticeMode);
  } else if (result === "type") {
    const answer = String(fd.get("answer") || "");
    await reviewService.reviewCardWithTypedAnswer(env, cardId, answer, isPracticeMode);
  }

  return { ok: true };
}

function formatTimeUntil(dueAt: string | null): string {
  if (!dueAt) return "No cards scheduled";

  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  return "Soon!";
}

export default function Review() {
  const { card, project, stats, mode } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  if (!card) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: projectForegroundColor }}>
            🎉 All Done!
          </h1>
          <p className="text-lg text-gray-700">Great job! You've reviewed all your cards for now.</p>
        </div>

        {stats && stats.total_cards > 0 && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-blue-700">{stats.total_cards}</div>
                <div className="text-sm font-medium text-blue-600 mt-1">Total Cards</div>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-green-700">{stats.mastered_cards}</div>
                <div className="text-sm font-medium text-green-600 mt-1">⭐ Mastered</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-yellow-700">{stats.learning_cards}</div>
                <div className="text-sm font-medium text-yellow-600 mt-1">📚 Learning</div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-purple-700">{stats.new_cards}</div>
                <div className="text-sm font-medium text-purple-600 mt-1">✨ New</div>
              </div>
            </div>

            {/* Next Review */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: projectColor, color: projectForegroundColor }}
            >
              <div className="text-lg font-semibold mb-2">⏰ Next Review</div>
              <div className="text-3xl font-bold">{formatTimeUntil(stats.next_due_at)}</div>
              {stats.next_due_at && (
                <div className="text-sm mt-2 opacity-80">
                  Keep up the great work! Come back later to review more cards.
                </div>
              )}
            </div>

            {/* Practice Mode Button */}
            <Link
              to={`?mode=practice`}
              className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              🎮 Practice Random Cards
            </Link>

            <Link
              to={`/p/${project?.id}`}
              className="block w-full text-center text-gray-600 hover:text-gray-800 underline mt-4"
            >
              ← Back to Project
            </Link>
          </div>
        )}

        {(!stats || stats.total_cards === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600 mb-6">No cards yet! Let's create some.</p>
            <Link
              to={`/p/${project?.id}/cards/new`}
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              ➕ Add Your First Card
            </Link>
          </div>
        )}
      </div>
    );
  }

  const isPracticeMode = mode === "practice";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isPracticeMode ? "🎮" : "📖"}</span>
          <span className="font-semibold text-lg">
            {isPracticeMode ? "Practice Mode" : "Review Mode"}
          </span>
        </div>
        {isPracticeMode ? (
          <Link
            to={`?mode=review`}
            className="text-sm bg-white border-2 border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Switch to Review
          </Link>
        ) : (
          <Link
            to={`?mode=practice`}
            className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200"
          >
            Practice Mode
          </Link>
        )}
      </div>

      {/* Progress indicator */}
      {stats && !isPracticeMode && (
        <div className="mb-4 text-center">
          <div className="text-sm font-medium text-gray-600">
            {stats.due_now > 1 ? `${stats.due_now - 1} more cards to review` : "Last card!"}
          </div>
        </div>
      )}

      <CardFlip front={card.front} back={card.back} color={projectColor} foregroundColor={projectForegroundColor} />

      {/* Button Form */}
      <Form method="post" className="mt-6 flex gap-3">
        <input type="hidden" name="cardId" value={card.id} />
        <input type="hidden" name="mode" value={mode} />
        <button
          name="result"
          value="again"
          className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="text-2xl mb-1">😅</div>
          <div>Again</div>
        </button>
        <button
          name="result"
          value="good"
          className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="text-2xl mb-1">✅</div>
          <div>Got It!</div>
        </button>
      </Form>

      {/* Type Answer Form */}
      <Form method="post" className="mt-4">
        <input type="hidden" name="cardId" value={card.id} />
        <input type="hidden" name="mode" value={mode} />
        <div className="flex gap-3">
          <input
            name="answer"
            placeholder="Type your answer..."
            className="flex-1 border-2 border-gray-300 p-4 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
            autoComplete="off"
          />
          <button
            name="result"
            value="type"
            className="bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Check ✏️
          </button>
        </div>
      </Form>

      <Link
        to={`/p/${project?.id}`}
        className="block text-center text-gray-600 hover:text-gray-800 underline mt-6"
      >
        ← Back to Project
      </Link>
    </div>
  );
}

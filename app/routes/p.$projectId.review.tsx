// app/routes/p.$projectId.review.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useLoaderData, useActionData, Link, useMatches } from "react-router";
import { useState, useEffect } from "react";
import { requireUserId } from "../server/session";
import { CardFlip } from "../components/CardFlip";
import * as reviewService from "../services/review.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "review"; // "review" or "practice"

  const stats = await reviewService.getProjectStats(context.cloudflare.env, projectId, userId);

  let card = null;
  let practiceCards = null;

  if (mode === "practice") {
    // Get a session of random cards for practice
    practiceCards = await reviewService.getRandomCardsForPracticeSession(context.cloudflare.env, projectId, userId, 10);
  } else {
    card = await reviewService.getNextDueCard(context.cloudflare.env, projectId, userId);
  }

  return { card, practiceCards, stats, mode };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const fd = await request.formData();
  const cardId = String(fd.get("cardId"));
  const result = String(fd.get("result")); // again|good
  const mode = String(fd.get("mode") || "review");
  const isPracticeMode = mode === "practice";
  const env = context.cloudflare.env;

  if (result === "again") {
    await reviewService.reviewCardAgain(env, cardId, isPracticeMode);
  } else if (result === "good") {
    await reviewService.reviewCardGood(env, cardId, isPracticeMode);
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

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  return "Soon!";
}

export default function Review() {
  const { card, practiceCards, stats, mode } = useLoaderData<typeof loader>();
  const matches = useMatches();
  // Find the layout route data
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  // Practice mode state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<("good" | "again")[]>([]); // Track all answers
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isPracticeMode = mode === "practice";

  // Calculate score directly from answers array - no useMemo needed
  const score = {
    correct: answers.filter((a) => a === "good").length,
    incorrect: answers.filter((a) => a === "again").length,
  };

  // Handle auto-advance after answer is recorded
  useEffect(() => {
    if (isPracticeMode && practiceCards && answers.length > currentCardIndex) {
      // Start transition
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        if (currentCardIndex < practiceCards.length - 1) {
          setIsFlipped(false);
          setCurrentCardIndex((prev) => prev + 1);
          setTimeout(() => setIsTransitioning(false), 50);
        } else {
          setSessionComplete(true);
          setIsTransitioning(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [answers.length, isPracticeMode, practiceCards, currentCardIndex]);

  const handleCardFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleAnswer = (result: "again" | "good") => {
    // Add this answer to the array
    setAnswers((prev) => [...prev, result]);
  };

  // Practice mode - session complete
  if (isPracticeMode && sessionComplete && practiceCards) {
    const total = score.correct + score.incorrect;
    const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: projectForegroundColor }}>
            Practice Complete!
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-6xl mb-4">{percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "💪"}</div>
            <div className="text-5xl font-bold mb-4" style={{ color: projectForegroundColor }}>
              {percentage}%
            </div>
            <div className="text-xl text-gray-700 mb-6">
              {score.correct} correct, {score.incorrect} need review
            </div>
            <div className="text-gray-600">
              {percentage >= 80 && "Excellent work! You're mastering these cards!"}
              {percentage >= 60 && percentage < 80 && "Good job! Keep practicing to improve."}
              {percentage < 60 && "Keep going! Practice makes perfect."}
            </div>
          </div>

          <Link
            to={`?mode=practice`}
            onClick={() => {
              setCurrentCardIndex(0);
              setAnswers([]);
              setSessionComplete(false);
              setIsFlipped(false);
            }}
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 mb-4"
          >
            Practice Again
          </Link>
        </div>
      </div>
    );
  }

  // Practice mode - show current card from session
  if (isPracticeMode && practiceCards && practiceCards.length > 0) {
    const currentCard = practiceCards[currentCardIndex];

    return (
      <div className="max-w-2xl mx-auto" key={`card-${currentCardIndex}-${answers.length}`}>
        {/* Progress Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow p-4 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold">
                Card {currentCardIndex + 1} of {practiceCards.length}
              </span>
              <span className="text-sm text-gray-600">
                Score: {score.correct} / {score.correct + score.incorrect} (Total answers: {answers.length})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentCardIndex + 1) / practiceCards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="mb-4">
          <div className={`relative transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
            <CardFlip
              front={currentCard.front}
              back={currentCard.back}
              color={projectColor}
              foregroundColor={projectForegroundColor}
              flipped={isFlipped}
              onFlip={handleCardFlip}
            />
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
              <span className="text-blue-600 underline text-sm font-medium opacity-80">
                {isFlipped ? "Click to view question" : "Click to view answer"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Form method="post" className="flex gap-4">
          <input type="hidden" name="cardId" value={currentCard.id} />
          <input type="hidden" name="mode" value="practice" />

          <button
            type="button"
            name="result"
            value="again"
            disabled={!isFlipped}
            onClick={() => {
              handleAnswer("again");
              // Submit to server in the background for persistence
              const formData = new FormData();
              formData.append("cardId", currentCard.id);
              formData.append("result", "again");
              formData.append("mode", "practice");
              fetch(window.location.pathname, {
                method: "POST",
                body: formData,
              }).catch((err) => console.error("Failed to save:", err));
            }}
            className="flex-1 bg-red-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="text-sm mb-1">I need to review this</div>
            <div className="text-lg">Review Again</div>
          </button>

          <button
            type="button"
            name="result"
            value="good"
            disabled={!isFlipped}
            onClick={() => {
              handleAnswer("good");
              // Submit to server in the background for persistence
              const formData = new FormData();
              formData.append("cardId", currentCard.id);
              formData.append("result", "good");
              formData.append("mode", "practice");
              fetch(window.location.pathname, {
                method: "POST",
                body: formData,
              }).catch((err) => console.error("Failed to save:", err));
            }}
            className="flex-1 bg-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="text-sm mb-1">I know this well</div>
            <div className="text-lg">I Got This!</div>
          </button>
        </Form>
      </div>
    );
  }

  // Practice mode - no cards available
  if (isPracticeMode && (!practiceCards || practiceCards.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: projectForegroundColor }}>
          No Cards Available
        </h1>
        <p className="text-lg text-gray-700 mb-6">Add some cards to start practicing!</p>
        <Link
          to={`/p/${project?.id}/cards/new`}
          className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Add Your First Card
        </Link>
      </div>
    );
  }

  // Review mode - no cards due
  if (!card) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: projectForegroundColor }}>
            All Done!
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
                <div className="text-sm font-medium text-green-600 mt-1">Mastered</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-yellow-700">{stats.learning_cards}</div>
                <div className="text-sm font-medium text-yellow-600 mt-1">Learning</div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 shadow-md">
                <div className="text-4xl font-bold text-purple-700">{stats.new_cards}</div>
                <div className="text-sm font-medium text-purple-600 mt-1">New</div>
              </div>
            </div>

            {/* Next Review */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: projectColor, color: projectForegroundColor }}
            >
              <div className="text-lg font-semibold mb-2">Next Review</div>
              <div className="text-3xl font-bold">{formatTimeUntil(stats.next_due_at)}</div>
              {stats.next_due_at && (
                <div className="text-sm mt-2 opacity-80">
                  Keep up the great work! Come back later to review more cards.
                </div>
              )}
            </div>
          </div>
        )}

        {(!stats || stats.total_cards === 0) && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-6">No cards yet! Let's create some.</p>
            <Link
              to={`/p/${project?.id}/cards/new`}
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Add Your First Card
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Review mode - show card
  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">Review Mode</span>
        </div>
        <Link
          to={`?mode=practice`}
          className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200"
        >
          Practice Mode
        </Link>
      </div>

      {/* Progress indicator */}
      {stats && (
        <div className="mb-4 text-center">
          <div className="text-sm font-medium text-gray-600">
            {stats.due_now > 1 ? `${stats.due_now - 1} more cards to review` : "Last card!"}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="text-center text-sm font-medium text-gray-500 mb-2">{isFlipped ? "Answer" : "Question"}</div>
        <div className="relative">
          <CardFlip
            front={card.front}
            back={card.back}
            color={projectColor}
            foregroundColor={projectForegroundColor}
            flipped={isFlipped}
            onFlip={handleCardFlip}
          />
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <span className="text-blue-600 underline text-sm font-medium opacity-80">
              {isFlipped ? "Click to view question" : "Click to view answer"}
            </span>
          </div>
        </div>
      </div>

      {/* Button Form */}
      <Form method="post" className="flex gap-4">
        <input type="hidden" name="cardId" value={card.id} />
        <input type="hidden" name="mode" value="review" />

        <button
          name="result"
          value="again"
          disabled={!isFlipped}
          className="flex-1 bg-red-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="text-sm mb-1">I need to review this</div>
          <div className="text-lg">Review Again</div>
        </button>

        <button
          name="result"
          value="good"
          disabled={!isFlipped}
          className="flex-1 bg-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="text-sm mb-1">I know this well</div>
          <div className="text-lg">I Got This!</div>
        </button>
      </Form>
    </div>
  );
}

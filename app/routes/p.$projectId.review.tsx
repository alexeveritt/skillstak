// app/routes/p.$projectId.review.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useLoaderData, useActionData } from "react-router";
import { requireUserId } from "../server/session";
import { q, run } from "../server/db";
import { CardFlip } from "../components/CardFlip";
import { addDaysIso, addMinutesIso } from "../lib/time";
import { dist, normalize } from "../lib/levenshtein";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  // next due card
  const card =
    (
      await q<any>(
        context.cloudflare.env,
        `
    SELECT c.id, c.front, c.back, c.color, s.interval_days, s.ease, s.streak, s.lapses
    FROM card c
    JOIN project p ON p.id = c.project_id
    JOIN card_schedule s ON s.card_id = c.id
    WHERE p.user_id = ? AND p.id = ? AND s.due_at <= datetime('now')
    ORDER BY s.due_at LIMIT 1
  `,
        [userId, projectId]
      )
    )[0] || null;
  return { card, mode: "self" as const }; // toggle to "type" in UI later
}

function scheduleAgain(env: any, cardId: string) {
  return run(
    env,
    `UPDATE card_schedule SET streak=0, lapses=lapses+1, ease = MAX(1.3, ease - 0.2), interval_days=0, due_at=? WHERE card_id=?`,
    [addMinutesIso(10), cardId]
  );
}
function scheduleGood(env: any, cardId: string, intervalDays: number, ease: number, streak: number) {
  const newStreak = streak + 1;
  const newInterval = intervalDays === 0 ? 1 : Math.round(intervalDays * ease);
  const newEase = Math.min(3.0, ease + 0.05);
  return run(env, `UPDATE card_schedule SET streak=?, interval_days=?, ease=?, due_at=? WHERE card_id=?`, [
    newStreak,
    newInterval,
    newEase,
    addDaysIso(newInterval),
    cardId,
  ]);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const fd = await request.formData();
  const cardId = String(fd.get("cardId"));
  const result = String(fd.get("result")); // again|good|type
  const env = context.cloudflare.env;
  const c = (
    await q<any>(
      env,
      "SELECT interval_days, ease, streak, back FROM card c JOIN card_schedule s ON s.card_id=c.id WHERE c.id=?",
      [cardId]
    )
  )[0];
  if (!c) return { done: true };

  if (result === "again") {
    await scheduleAgain(env, cardId);
  } else if (result === "good") {
    await scheduleGood(env, cardId, c.interval_days, c.ease, c.streak);
  } else if (result === "type") {
    const input = normalize(String(fd.get("answer") || ""));
    const target = normalize(String(c.back || ""));
    const allow = target.length <= 5 ? 0 : target.length <= 15 ? 1 : 2;
    const ok = input === target || dist(input, target) <= allow;
    if (ok) await scheduleGood(env, cardId, c.interval_days, c.ease, c.streak);
    else await scheduleAgain(env, cardId);
  }

  // log review (optional)
  // await run(env, "INSERT INTO review ...", [...] )

  return { ok: true };
}

export default function Review() {
  const { card } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  if (!card) return <p>No cards due.</p>;
  return (
    <div className="grid gap-4">
      <CardFlip front={card.front} back={card.back} color={card.color || "#fef3c7"} />
      <Form method="post" className="flex gap-2">
        <input type="hidden" name="cardId" value={card.id} />
        <button name="result" value="again" className="border rounded px-3 py-2">
          Again
        </button>
        <button name="result" value="good" className="border rounded px-3 py-2">
          Good
        </button>
      </Form>
      <Form method="post" className="flex gap-2">
        <input type="hidden" name="cardId" value={card.id} />
        <input name="answer" placeholder="Type your answer" className="border p-2 rounded flex-1" />
        <button name="result" value="type" className="border rounded px-3 py-2">
          Check
        </button>
      </Form>
    </div>
  );
}

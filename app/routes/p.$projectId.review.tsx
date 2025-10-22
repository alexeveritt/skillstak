// app/routes/p.$projectId.review.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useLoaderData, useActionData } from "react-router";
import { requireUserId } from "../server/session";
import { CardFlip } from "../components/CardFlip";
import * as reviewService from "../services/review.service";
import * as projectService from "../services/project.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);
  const card = await reviewService.getNextDueCard(context.cloudflare.env, projectId, userId);

  return { card, project, mode: "self" as const }; // toggle to "type" in UI later
}

export async function action({ request, context }: ActionFunctionArgs) {
  const fd = await request.formData();
  const cardId = String(fd.get("cardId"));
  const result = String(fd.get("result")); // again|good|type
  const env = context.cloudflare.env;

  if (result === "again") {
    await reviewService.reviewCardAgain(env, cardId);
  } else if (result === "good") {
    await reviewService.reviewCardGood(env, cardId);
  } else if (result === "type") {
    const answer = String(fd.get("answer") || "");
    await reviewService.reviewCardWithTypedAnswer(env, cardId, answer);
  }

  // log review (optional)
  // await run(env, "INSERT INTO review ...", [...] )

  return { ok: true };
}

export default function Review() {
  const { card, project } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  if (!card) return <p>No cards due.</p>;
  return (
    <div className="grid gap-4">
      <CardFlip front={card.front} back={card.back} color={projectColor} foregroundColor={projectForegroundColor} />
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

// app/routes/p.$projectId.cards.new.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, redirect, useActionData } from "react-router";
import { requireUserId } from "../server/session";
import { run } from "../server/db";
import { cardSchema } from "../lib/z";
import { newId } from "../lib/id";
import { nowIso } from "../lib/time";

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId({ request, cloudflare: context.cloudflare });
  return null;
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const fd = await request.formData();
  const data = {
    front: String(fd.get("front") || ""),
    back: String(fd.get("back") || ""),
    color: String(fd.get("color") || "") || undefined,
  };
  const parsed = cardSchema.safeParse(data);
  if (!parsed.success) return { error: "Front/back required" };
  const id = newId();
  await run(context.cloudflare.env, "INSERT INTO card (id, project_id, front, back, color) VALUES (?, ?, ?, ?, ?)", [
    id,
    projectId,
    data.front,
    data.back,
    data.color || null,
  ]);
  // seed schedule
  await run(
    context.cloudflare.env,
    "INSERT INTO card_schedule (card_id, due_at, interval_days, ease, streak, lapses) VALUES (?, ?, 0, 2.5, 0, 0)",
    [id, nowIso()]
  );
  return redirect(`/p/${projectId}`);
}

export default function NewCard() {
  const data = useActionData<typeof action>();
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-2">New card</h1>
      {data?.error && <p className="text-red-600">{data.error}</p>}
      <Form method="post" className="grid gap-2">
        <input name="front" placeholder="Front" className="border p-2 rounded" />
        <textarea name="back" placeholder="Back" className="border p-2 rounded" />
        <input name="color" placeholder="#fef3c7" className="border p-2 rounded" />
        <button className="bg-black text-white rounded px-4 py-2">Save</button>
      </Form>
    </div>
  );
}

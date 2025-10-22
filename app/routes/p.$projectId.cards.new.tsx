// app/routes/p.$projectId.cards.new.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useParams } from "react-router";
import { requireUserId } from "../server/session";
import { cardSchema } from "../lib/z";
import * as cardService from "../services/card.service";

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId({ request, cloudflare: context.cloudflare });
  return null;
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const fd = await request.formData();
  const data = {
    front: String(fd.get("front") || ""),
    back: String(fd.get("back") || ""),
  };
  const parsed = cardSchema.safeParse(data);
  if (!parsed.success) return { error: "Front/back required" };

  await cardService.createCard(context.cloudflare.env, projectId, data.front, data.back);

  return redirect(`/p/${projectId}`);
}

export default function NewCard() {
  const data = useActionData<typeof action>();
  const params = useParams();
  const projectId = params.projectId!;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-2">New card</h1>
      {data?.error && <p className="text-red-600">{data.error}</p>}
      <Form method="post" className="grid gap-2">
        <input name="front" placeholder="Front" className="border p-2 rounded" />
        <textarea name="back" placeholder="Back" className="border p-2 rounded" />
        <div className="flex items-center gap-2">
          <button className="bg-black text-white rounded px-4 py-2">Save</button>
          <Link to={`/p/${projectId}`} className="underline">
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}

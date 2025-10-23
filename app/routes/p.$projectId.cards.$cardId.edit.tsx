// app/routes/p.$projectId.cards.$cardId.edit.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData, useMatches } from "react-router";
import { requireUserId } from "../server/session";
import { cardSchema } from "../lib/z";
import * as cardService from "../services/card.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({
    request,
    cloudflare: context.cloudflare,
  });

  const projectId = params.projectId!;
  const cardId = params.cardId!;

  const card = await cardService.getCard(context.cloudflare.env, cardId, projectId);

  if (!card) {
    throw new Response("Card not found", { status: 404 });
  }

  return { card };
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({
    request,
    cloudflare: context.cloudflare,
  });
  const env = context.cloudflare.env;
  const projectId = params.projectId!;
  const cardId = params.cardId!;

  // Check ownership first (protect updates/deletes)
  const owns = await cardService.verifyCardOwnership(env, cardId, projectId, userId);
  if (!owns) {
    throw new Response("Not found", { status: 404 });
  }

  const fd = await request.formData();
  const intent = String(fd.get("intent") || "save");

  if (intent === "delete") {
    await cardService.deleteCard(env, cardId, projectId);
    return redirect(`/p/${projectId}`);
  }

  // Update
  const data = {
    front: String(fd.get("front") || ""),
    back: String(fd.get("back") || ""),
  };
  const parsed = cardSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Front and back are required", values: data };
  }

  await cardService.updateCard(env, cardId, projectId, data.front, data.back);

  return redirect(`/p/${projectId}`);
}

export default function EditCard() {
  const { card } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const actionData = useActionData<typeof action>() as
    | { error?: string; values?: { front: string; back: string } }
    | undefined;

  const defaults = {
    front: actionData?.values?.front ?? card?.front ?? "",
    back: actionData?.values?.back ?? card?.back ?? "",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Edit Card - <span className="text-gray-600">{project?.name}</span>
      </h1>

      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{actionData.error}</div>
      )}

      <Form method="post" className="space-y-6 mb-8">
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
            Front of Card
          </label>
          <textarea
            id="front"
            name="front"
            defaultValue={defaults.front}
            placeholder="Enter the question or prompt..."
            rows={4}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
            Back of Card
          </label>
          <textarea
            id="back"
            name="back"
            defaultValue={defaults.back}
            placeholder="Enter the answer or response..."
            rows={4}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            name="intent"
            value="save"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            Save Changes
          </button>
          <Link to={`/p/${project?.id}`} className="text-gray-600 hover:text-gray-800 underline transition-colors">
            Cancel
          </Link>
        </div>
      </Form>

      <Form method="post" className="pt-6 border-t border-gray-200">
        <input type="hidden" name="intent" value="delete" />
        <button
          className="text-red-700 hover:text-red-800 border border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 rounded-lg px-4 py-2.5 font-medium transition-colors"
          onClick={(e) => {
            if (!confirm("Delete this card? This cannot be undone.")) {
              e.preventDefault();
            }
          }}
        >
          Delete Card
        </button>
      </Form>
    </div>
  );
}

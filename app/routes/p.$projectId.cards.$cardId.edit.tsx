// app/routes/p.$projectId.cards.$cardId.edit.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import { cardSchema } from "../lib/z";
import * as projectService from "../services/project.service";
import * as cardService from "../services/card.service";

type LoaderData = {
  project: { id: string; name: string } | null;
  card: {
    id: string;
    front: string;
    back: string;
  } | null;
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({
    request,
    cloudflare: context.cloudflare,
  });

  const projectId = params.projectId!;
  const cardId = params.cardId!;

  // Ensure the project belongs to the current user and load the card.
  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);

  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }

  const card = await cardService.getCard(context.cloudflare.env, cardId, projectId);

  if (!card) {
    throw new Response("Card not found", { status: 404 });
  }

  const data: LoaderData = { project, card };
  return data;
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
  const { project, card } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { error?: string; values?: { front: string; back: string } }
    | undefined;

  const defaults = {
    front: actionData?.values?.front ?? card?.front ?? "",
    back: actionData?.values?.back ?? card?.back ?? "",
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-2">
        Edit card - <span className="text-slate-600">{project?.name}</span>
      </h1>

      {actionData?.error && <p className="text-red-600 mb-2">{actionData.error}</p>}

      <Form method="post" className="grid gap-2 mb-4">
        <label className="text-sm">Front</label>
        <input name="front" defaultValue={defaults.front} className="border p-2 rounded" placeholder="Front" />

        <label className="text-sm">Back</label>
        <textarea
          name="back"
          defaultValue={defaults.back}
          className="border p-2 rounded min-h-[120px]"
          placeholder="Back"
        />

        <div className="flex items-center gap-2 mt-2">
          <button name="intent" value="save" className="bg-black text-white rounded px-4 py-2">
            Save
          </button>
          <Link to={`/p/${project?.id}`} className="underline">
            Cancel
          </Link>
        </div>
      </Form>

      <Form method="post" className="mt-6">
        <input type="hidden" name="intent" value="delete" />
        <button
          className="text-red-700 border border-red-300 rounded px-3 py-2"
          onClick={(e) => {
            if (!confirm("Delete this card? This cannot be undone.")) {
              e.preventDefault();
            }
          }}
        >
          Delete card
        </button>
      </Form>
    </div>
  );
}

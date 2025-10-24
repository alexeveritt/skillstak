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
  if (!parsed.success) {
    // Collect all error messages from Zod and join them
    const errorMsg = parsed.error.errors.map((e) => e.message).join("; ");
    return { error: errorMsg };
  }

  await cardService.createCard(context.cloudflare.env, projectId, data.front, data.back);

  return redirect(`/p/${projectId}/cards`);
}

export default function NewCard() {
  const data = useActionData<typeof action>();
  const params = useParams();
  const projectId = params.projectId!;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Card</h1>
      {data?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{data.error}</div>
      )}
      <Form method="post" className="space-y-6">
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
            Front of Card
          </label>
          <textarea
            id="front"
            name="front"
            placeholder="Enter the question or prompt..."
            rows={4}
            maxLength={200}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <div className="text-xs text-gray-500 mt-1">Max 200 characters</div>
        </div>
        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
            Back of Card
          </label>
          <textarea
            id="back"
            name="back"
            placeholder="Enter the answer or response..."
            rows={4}
            maxLength={200}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <div className="text-xs text-gray-500 mt-1">Max 200 characters</div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors">
            Save Card
          </button>
          <Link to={`/p/${projectId}`} className="text-gray-600 hover:text-gray-800 underline transition-colors">
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}

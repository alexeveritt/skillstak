import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useActionData, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { requireUserId } from "../server/session";
import * as projectService from "../services/project.service";
import * as cardService from "../services/card.service";

type ImportCard = {
  f: string;
  b: string;
  tempId?: string;
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);

  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }

  return { project };
}

export async function action({ params, context, request }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "parse") {
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return { error: "Please select a file to import" };
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        return { error: "Invalid file format. Expected an array of cards." };
      }

      const cards: ImportCard[] = [];
      const errors: string[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const card = parsed[i];

        if (typeof card !== "object" || card === null) {
          errors.push(`Card ${i + 1}: Invalid card format`);
          continue;
        }

        if (!card.f || typeof card.f !== "string" || card.f.trim().length === 0) {
          errors.push(`Card ${i + 1}: Missing or invalid 'f' (front)`);
          continue;
        }

        if (!card.b || typeof card.b !== "string" || card.b.trim().length === 0) {
          errors.push(`Card ${i + 1}: Missing or invalid 'b' (back)`);
          continue;
        }

        cards.push({
          f: card.f.trim(),
          b: card.b.trim(),
          tempId: `temp-${i}`,
        });
      }

      if (cards.length === 0 && errors.length > 0) {
        return { error: "No valid cards found in file", validationErrors: errors };
      }

      return { cards, validationErrors: errors.length > 0 ? errors : undefined };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { error: "Invalid JSON file. Please check the file format." };
      }
      return { error: "Failed to read file. Please try again." };
    }
  }

  if (intent === "import") {
    const cardsJson = formData.get("cardsData") as string;

    if (!cardsJson) {
      return { error: "No cards data to import" };
    }

    try {
      const cards: ImportCard[] = JSON.parse(cardsJson);

      if (cards.length === 0) {
        return { error: "No cards to import. Please select at least one card." };
      }

      // Import all cards
      for (const card of cards) {
        await cardService.createCard(context.cloudflare.env, projectId, card.f, card.b);
      }

      return redirect(`/p/${projectId}/cards`);
    } catch (error) {
      return { error: "Failed to import cards. Please try again." };
    }
  }

  return { error: "Invalid action" };
}

export default function ImportCards() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [cards, setCards] = useState<ImportCard[]>(actionData?.cards || []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Update cards state when action data changes
  useEffect(() => {
    if (actionData?.cards) {
      setCards(actionData.cards);
    }
  }, [actionData?.cards]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setCards([]);
  };

  const handleRemoveCard = (tempId: string) => {
    setCards((prev) => prev.filter((card) => card.tempId !== tempId));
  };

  const showPreview = cards.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Import Cards</h1>
      <p className="text-gray-600 mb-6">
        Import cards into <strong>{project.name}</strong>
      </p>

      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{actionData.error}</div>
      )}

      {actionData?.validationErrors && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="font-medium mb-2">Some cards had issues:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {actionData.validationErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {!showPreview ? (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Cards File</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload a JSON file with your cards. Format:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              [{"{"}"f":"Front", "b":"Back"{"}"}]
            </code>
          </p>

          <Form method="post" encType="multipart/form-data">
            <input type="hidden" name="intent" value="parse" />

            <div className="mb-4">
              <input
                type="file"
                name="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!selectedFile}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
              >
                Upload and Preview
              </button>
              <a
                href={`/p/${project.id}/edit`}
                className="text-gray-600 hover:text-gray-800 underline transition-colors"
              >
                Cancel
              </a>
            </div>
          </Form>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Preview Cards ({cards.length})</h2>
          <p className="text-sm text-gray-600 mb-4">
            Review the cards below. You can remove any cards you don't want to import.
          </p>

          <div className="space-y-3 mb-6 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {cards.map((card) => (
              <div key={card.tempId} className="border rounded-lg p-4 bg-white flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">
                    <span className="text-xs text-gray-500 uppercase">Front:</span> {card.f}
                  </div>
                  <div className="text-gray-700 text-sm">
                    <span className="text-xs text-gray-500 uppercase">Back:</span> {card.b}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCard(card.tempId!)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No cards left to import. Add some back or upload a different file.</p>
              <a href={`/p/${project.id}/cards/import`} className="text-blue-600 hover:text-blue-800 underline">
                Start Over
              </a>
            </div>
          ) : (
            <Form method="post">
              <input type="hidden" name="intent" value="import" />
              <input type="hidden" name="cardsData" value={JSON.stringify(cards)} />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
                >
                  Import {cards.length} Card{cards.length !== 1 ? "s" : ""}
                </button>
                <a
                  href={`/p/${project.id}/cards/import`}
                  className="text-gray-600 hover:text-gray-800 underline transition-colors"
                >
                  Start Over
                </a>
                <a
                  href={`/p/${project.id}/edit`}
                  className="text-gray-600 hover:text-gray-800 underline transition-colors"
                >
                  Cancel
                </a>
              </div>
            </Form>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Example File Format</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
          {`[
  { "f": "What is 2 + 2?", "b": "4" },
  { "f": "Capital of France?", "b": "Paris" },
  { "f": "H2O is?", "b": "Water" }
]`}
        </pre>
      </div>
    </div>
  );
}

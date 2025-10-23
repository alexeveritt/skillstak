import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useMatches } from "react-router";
import { useState } from "react";
import { requireUserId } from "../server/session";
import * as cardService from "../services/card.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const cards = await cardService.listCards(context.cloudflare.env, projectId);

  return { cards };
}

export default function ExportCards() {
  const { cards: allCards } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set(allCards.map((card) => card.id)));

  const handleToggleCard = (cardId: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedCardIds.size === allCards.length) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(allCards.map((card) => card.id)));
    }
  };

  const handleExport = () => {
    const cardsToExport = allCards
      .filter((card) => selectedCardIds.has(card.id))
      .map((card) => ({
        f: card.front,
        b: card.back,
      }));

    if (cardsToExport.length === 0) {
      return;
    }

    const json = JSON.stringify(cardsToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-cards.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedCount = selectedCardIds.size;

  if (allCards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Export Cards</h1>
        <p className="text-gray-600 mb-6">
          Export cards from <strong>{project.name}</strong>
        </p>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          This project has no cards to export.
        </div>

        <div className="mt-4">
          <a href={`/p/${project.id}/edit`} className="text-blue-600 hover:text-blue-800 underline">
            Back to Edit Project
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Export Cards</h1>
      <p className="text-gray-600 mb-6">
        Export cards from <strong>{project.name}</strong>
      </p>

      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Select Cards to Export ({selectedCount} of {allCards.length})
          </h2>
          <button
            type="button"
            onClick={handleToggleAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {selectedCount === allCards.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="space-y-3 mb-6 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {allCards.map((card) => {
            const isSelected = selectedCardIds.has(card.id);
            return (
              <label
                key={card.id}
                className={`border rounded-lg p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSelected ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleCard(card.id)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">
                    <span className="text-xs text-gray-500 uppercase">Front:</span> {card.front}
                  </div>
                  <div className="text-gray-700 text-sm">
                    <span className="text-xs text-gray-500 uppercase">Back:</span> {card.back}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {selectedCount === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">Please select at least one card to export.</p>
            <a href={`/p/${project.id}/edit`} className="text-blue-600 hover:text-blue-800 underline">
              Back to Edit Project
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
            >
              Export {selectedCount} Card{selectedCount !== 1 ? "s" : ""}
            </button>
            <a href={`/p/${project.id}/edit`} className="text-gray-600 hover:text-gray-800 underline transition-colors">
              Cancel
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Export Format</h3>
        <p className="text-sm text-gray-700">
          Cards will be exported as a JSON file with the format:{" "}
          <code className="bg-white px-2 py-1 rounded text-xs">
            [{"{"}"f":"Front", "b":"Back"{"}"}]
          </code>
        </p>
      </div>
    </div>
  );
}

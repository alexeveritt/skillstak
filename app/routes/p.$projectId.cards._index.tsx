// app/routes/p.$projectId.cards._index.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useLoaderData, useMatches } from "react-router";
import { useState } from "react";
import { requireUserId } from "../server/session";
import * as cardService from "../services/card.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { EditCardModal } from "../components/EditCardModal";
import { AddCardModal } from "../components/AddCardModal";
import { Eye, Pencil, Trash2 } from "lucide-react";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const cards = await cardService.listCards(context.cloudflare.env, projectId);

  return { cards };
}

export async function action({ params, context, request }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const formData = await request.formData();
  const intent = formData.get("intent");
  const cardId = formData.get("cardId") as string;

  if (intent === "delete" && cardId) {
    await cardService.deleteCard(context.cloudflare.env, cardId, projectId);
  }

  if (intent === "update" && cardId) {
    const front = String(formData.get("front") || "");
    const back = String(formData.get("back") || "");
    await cardService.updateCard(context.cloudflare.env, cardId, projectId, front, back);
  }

  if (intent === "create") {
    const front = String(formData.get("front") || "");
    const back = String(formData.get("back") || "");
    await cardService.createCard(context.cloudflare.env, projectId, front, back);
  }

  return redirect(`/p/${projectId}/cards`);
}

export default function CardsList() {
  const { cards } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  const [viewCardId, setViewCardId] = useState<string | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const viewCard = cards.find((c) => c.id === viewCardId);
  const deleteCard = cards.find((c) => c.id === deleteCardId);
  const editCard = cards.find((c) => c.id === editCardId);

  return (
    <>
      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-gray-600 mb-4">No cards yet! Add your first card to get started.</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-block bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800 font-semibold py-2 px-6 rounded-lg border border-blue-300 hover:shadow-md hover:from-blue-200 hover:to-indigo-300 transition-all"
          >
            ➕ Add First Card
          </button>
        </div>
      ) : (
        <>
          {/* Header with title and action button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">All Cards ({cards.length})</h2>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 font-semibold py-2 px-4 rounded-lg border border-green-300 hover:shadow-md hover:from-green-200 hover:to-emerald-300 transition-all flex items-center gap-1"
            >
              <span className="text-lg">➕</span>
              <span>Add Card</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col overflow-hidden border-2"
                style={{ borderColor: projectColor }}
              >
                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col" style={{ backgroundColor: `${projectColor}40` }}>
                  <div className="mb-3 flex-1">
                    <div
                      className="font-semibold text-gray-800 mb-2 line-clamp-1"
                      style={{ color: projectForegroundColor }}
                      title={card.front}
                    >
                      {card.front}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2" title={card.back}>
                      {card.back}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 bg-white flex divide-x divide-gray-200">
                  <button
                    type="button"
                    onClick={() => setViewCardId(card.id)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCardId(card.id)}
                    className="flex-1 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCardId(card.id)}
                    className="flex-1 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Card Modal */}
      <Dialog open={!!viewCardId} onOpenChange={(open) => !open && setViewCardId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Card Details</DialogTitle>
          </DialogHeader>
          {viewCard && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Front</label>
                <div
                  className="p-4 rounded-lg border-2"
                  style={{
                    backgroundColor: `${projectColor}40`,
                    borderColor: projectColor,
                    color: projectForegroundColor,
                  }}
                >
                  <p className="whitespace-pre-wrap">{viewCard.front}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Back</label>
                <div className="p-4 rounded-lg border-2 border-gray-300 bg-gray-50">
                  <p className="whitespace-pre-wrap text-gray-800">{viewCard.back}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteCardId} onOpenChange={(open) => !open && setDeleteCardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteCard && (
            <div className="space-y-4 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">{deleteCard.front}</p>
                <p className="text-sm text-red-600">{deleteCard.back}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteCardId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="cardId" value={deleteCard.id} />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete Card
                  </button>
                </Form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Card Modal */}
      <EditCardModal
        open={!!editCardId}
        onOpenChange={(open) => !open && setEditCardId(null)}
        card={editCard || null}
        projectColor={projectColor}
        projectForegroundColor={projectForegroundColor}
      />

      {/* Add Card Modal */}
      <AddCardModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
}

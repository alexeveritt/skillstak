import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData, useMatches, Link, useSearchParams } from "react-router";
import { useState } from "react";
import { requireUserId } from "../server/session";
import { DeleteProjectModal } from "../components/DeleteProjectModal";
import { ColorPicker } from "../components/ColorPicker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import * as projectService from "../services/project.service";
import * as cardService from "../services/card.service";
import { projectSchema } from "../lib/z";
import { FileDown, FileUp, Library, Settings, Trash2, Eye, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  // Get all cards for the cards panel
  const cards = await cardService.listCards(context.cloudflare.env, projectId);

  return { cards };
}

export async function action({ params, context, request }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await projectService.deleteProject(context.cloudflare.env, projectId, userId);
    return redirect("/");
  }

  if (intent === "deleteCard") {
    const cardId = formData.get("cardId") as string;
    if (cardId) {
      await cardService.deleteCard(context.cloudflare.env, cardId, projectId);
    }
    return redirect(`/p/${projectId}/edit?tab=cards`);
  }

  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || undefined;
  const foregroundColor = (formData.get("foregroundColor") as string) || undefined;

  const parsed = projectSchema.safeParse({ name });
  if (!parsed.success) {
    const errorMsg = parsed.error.errors.map((e) => e.message).join("; ");
    return { error: errorMsg };
  }

  await projectService.updateProject(context.cloudflare.env, projectId, userId, name.trim(), color, foregroundColor);
  return redirect(`/p/${projectId}`);
}

export default function EditProject() {
  const { cards } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;

  if (!project) {
    throw new Error("Project not found");
  }

  const [selectedColor, setSelectedColor] = useState(project.color || "#fef3c7");
  const [selectedForegroundColor, setSelectedForegroundColor] = useState(project.foreground_color || "#78350f");
  const activeTab = searchParams.get("tab") || "settings";
  const [viewCardId, setViewCardId] = useState<string | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const projectColor = project.color || "#fef3c7";
  const projectForegroundColor = project.foreground_color || "#78350f";
  const viewCard = cards.find((c) => c.id === viewCardId);
  const deleteCard = cards.find((c) => c.id === deleteCardId);

  const handleColorChange = (bg: string, fg: string) => {
    setSelectedColor(bg);
    setSelectedForegroundColor(fg);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-1">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Card Pack Settings</h2>
            <Form method="post" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                  Card Pack Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={project.name}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={50}
                />
                <div className="text-xs text-gray-500 mt-1.5">Maximum 50 characters</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Theme Color</label>
                <ColorPicker value={selectedColor} onChange={handleColorChange} />
                <input type="hidden" name="color" value={selectedColor} />
                <input type="hidden" name="foregroundColor" value={selectedForegroundColor} />
              </div>

              {/* Preview Card */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Preview</label>
                <div
                  className="rounded-lg p-6 border-2 shadow-sm"
                  style={{ backgroundColor: selectedColor, color: selectedForegroundColor }}
                >
                  <div className="font-semibold text-lg mb-2">Front of card</div>
                  <div className="opacity-90">Back of card</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-2.5 rounded-lg font-medium border border-blue-300 transition-colors"
                >
                  Save Changes
                </button>
                <Link
                  to={`/p/${project.id}`}
                  className="text-center px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </Form>
          </div>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards">
          {cards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-600 mb-4">No cards yet! Add your first card to get started.</p>
              <Link
                to={`/p/${project.id}/cards/new`}
                className="inline-block bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800 font-semibold py-2 px-6 rounded-lg border border-blue-300 hover:shadow-md hover:from-blue-200 hover:to-indigo-300 transition-all"
              >
                ➕ Add First Card
              </Link>
            </div>
          ) : (
            <>
              {/* Header with title and action button */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">All Cards ({cards.length})</h2>
                <Link
                  to={`/p/${project.id}/cards/new`}
                  className="bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 font-semibold py-2 px-4 rounded-lg border border-green-300 hover:shadow-md hover:from-green-200 hover:to-emerald-300 transition-all flex items-center gap-1"
                >
                  <span className="text-lg">➕</span>
                  <span>Add Card</span>
                </Link>
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
                    <div
                      className="p-4 flex-1 flex flex-col"
                      style={{ backgroundColor: `${projectColor}40` }}
                    >
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
                      <Link
                        to={`/p/${project.id}/cards/${card.id}/edit`}
                        className="flex-1 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Change</span>
                      </Link>
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
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="space-y-4">
            {/* Import/Export Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-2">Import & Export</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share your cards with others or create backups by exporting to JSON format.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  to={`/p/${project.id}/cards/import`}
                  className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-3 rounded-lg font-medium border border-blue-300 transition-colors"
                >
                  <FileUp className="w-4 h-4" />
                  Import Cards
                </Link>
                <Link
                  to={`/p/${project.id}/cards/export`}
                  className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium border border-green-300 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Export Cards
                </Link>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Deleting this card pack will permanently remove all {cards.length} cards. This action cannot be
                undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Warning: This will delete everything associated with "{project.name}"
                </p>
              </div>
              <DeleteProjectModal projectName={project.name} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
                  <input type="hidden" name="intent" value="deleteCard" />
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
    </div>
  );
}

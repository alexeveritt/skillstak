import { FileDown, FileUp, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useMatches,
  useNavigation,
  useSearchParams,
} from "react-router";
import { toast } from "sonner";
import { EditCardModal } from "../components/EditCardModal";
import { EditProjectCardGridItem } from "../components/EditProjectCardGridItem";
import { EditProjectCardList } from "../components/EditProjectCardList";
import { EditProjectSettingsForm } from "../components/EditProjectSettingsForm";
import { EditProjectTabs } from "../components/EditProjectTabs";
import { CloseConfirmationModal, DeleteCardModal, NewCardModal, ViewCardModal } from "../components/modals";
import { TabsContent } from "../components/ui/tabs";
import { cardSchema, projectSchema } from "../lib/z";
import { requireUserId } from "../server/session";
import * as cardService from "../services/card.service";
import * as projectService from "../services/project.service";
import { useTranslation } from "react-i18next";

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
    return redirect(`/p/${projectId}/edit?tab=cards&deleted=true`);
  }

  if (intent === "createCard" || intent === "createCardAndNew") {
    const data = {
      front: String(formData.get("front") || ""),
      back: String(formData.get("back") || ""),
    };
    const parsed = cardSchema.safeParse(data);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join("; ");
      return { error: errorMsg, intent };
    }

    await cardService.createCard(context.cloudflare.env, projectId, data.front, data.back);

    if (intent === "createCardAndNew") {
      // Return data but don't trigger a redirect - modal should stay open
      return { success: true, intent: "createCardAndNew" };
    }

    // For regular save, trigger redirect to refresh the cards list
    return redirect(`/p/${projectId}/edit?tab=cards`);
  }

  if (intent === "update") {
    const cardId = formData.get("cardId") as string;
    const front = String(formData.get("front") || "");
    const back = String(formData.get("back") || "");
    if (cardId) {
      await cardService.updateCard(context.cloudflare.env, cardId, projectId, front, back);
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
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const fetcher = useFetcher<typeof action>();
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
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  const projectColor = project.color || "#fef3c7";
  const projectForegroundColor = project.foreground_color || "#78350f";
  const viewCard = cards.find((c) => c.id === viewCardId);
  const deleteCard = cards.find((c) => c.id === deleteCardId);
  const editCard = cards.find((c) => c.id === editCardId);

  // Check if new card form is valid
  const isNewCardValid = newCardFront.trim() !== "" && newCardBack.trim() !== "";

  // Track previous fetcher state to detect transitions
  const prevFetcherStateRef = useRef(fetcher.state);
  const prevNavigationStateRef = useRef(navigation.state);

  // Handle successful card creation using fetcher
  useEffect(() => {
    // Detect transition from submitting to idle with success data
    if (
      prevFetcherStateRef.current === "submitting" &&
      fetcher.state === "idle" &&
      fetcher.data?.success &&
      fetcher.data?.intent === "createCardAndNew"
    ) {
      // Add Another button - clear form and show toast, keep modal open
      toast.success("Card added! 🎉");
      // Clear the state-controlled form fields
      setNewCardFront("");
      setNewCardBack("");
      // Re-focus the first field
      const firstField = document.querySelector('textarea[name="front"]') as HTMLTextAreaElement;
      if (firstField) {
        firstField.focus();
      }
    }

    // Update the ref for next render
    prevFetcherStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data]);

  // Handle successful card deletion
  useEffect(() => {
    // Check if we just deleted a card via URL parameter
    if (searchParams.get("deleted") === "true") {
      toast.success("Card deleted successfully! 🗑️");
      // Remove the parameter from URL without refreshing
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("deleted");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleColorChange = (bg: string, fg: string) => {
    setSelectedColor(bg);
    setSelectedForegroundColor(fg);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Helper function to check if form has content
  const hasFormContent = () => {
    return newCardFront.trim() !== "" || newCardBack.trim() !== "";
  };

  // Handle close button click
  const handleCloseModal = () => {
    if (hasFormContent()) {
      setShowCloseConfirmation(true);
    } else {
      setIsNewCardModalOpen(false);
    }
  };

  // Confirm close and discard changes
  const confirmClose = () => {
    setNewCardFront("");
    setNewCardBack("");
    setShowCloseConfirmation(false);
    setIsNewCardModalOpen(false);
  };

  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto">
      <EditProjectTabs activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Settings Tab */}
        <TabsContent value="settings">
          <EditProjectSettingsForm
            project={project}
            selectedColor={selectedColor}
            selectedForegroundColor={selectedForegroundColor}
            onColorChange={handleColorChange}
          />
        </TabsContent>
        {/* Cards Tab */}
        <TabsContent value="cards">
          <EditProjectCardList
            cards={cards}
            projectColor={projectColor}
            onAddCard={() => setIsNewCardModalOpen(true)}
            renderCard={(card) => (
              <EditProjectCardGridItem
                key={card.id}
                card={card}
                projectColor={projectColor}
                projectForegroundColor={projectForegroundColor}
                onView={setViewCardId}
                onEdit={setEditCardId}
                onDelete={setDeleteCardId}
              />
            )}
          />
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" /> {t("advancedTab.title")}
            </h2>
            <div className="space-y-6">
              {/* Import/Export Buttons */}
              <div className="flex gap-4 mb-6">
                <Link
                  to={`/p/${project.id}/cards/export`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 hover:bg-blue-200 transition-colors"
                >
                  <FileDown className="w-4 h-4" /> {t("advancedTab.exportCards")}
                </Link>
                <Link
                  to={`/p/${project.id}/cards/import`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300 hover:bg-green-200 transition-colors"
                >
                  <FileUp className="w-4 h-4" /> {t("advancedTab.importCards")}
                </Link>
              </div>
              {/* Delete Project Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-red-700 mb-2">{t("advancedTab.deleteProjectTitle")}</h3>
                <p className="text-sm text-gray-600 mb-4">{t("advancedTab.deleteProjectWarning")}</p>
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    {t("advancedTab.deleteProjectButton")}
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </TabsContent>
      </EditProjectTabs>

      {/* New Card Modal */}
      <NewCardModal
        open={isNewCardModalOpen}
        onOpenChange={(open) => {
          // Only allow closing via explicit actions
          if (!open) return;
        }}
        onClose={handleCloseModal}
        projectColor={projectColor}
        projectForegroundColor={projectForegroundColor}
        front={newCardFront}
        back={newCardBack}
        onFrontChange={setNewCardFront}
        onBackChange={setNewCardBack}
        actionError={actionData?.error}
        actionIntent={actionData?.intent}
      />

      {/* View Card Modal */}
      <ViewCardModal
        open={!!viewCardId}
        onOpenChange={(open) => !open && setViewCardId(null)}
        card={viewCard || null}
        projectColor={projectColor}
        projectForegroundColor={projectForegroundColor}
      />

      {/* Delete Card Modal */}
      <DeleteCardModal
        open={!!deleteCardId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCardId(null);
          }
        }}
        card={deleteCard || null}
        onCancel={() => setDeleteCardId(null)}
      />

      {/* Close Confirmation Modal */}
      <CloseConfirmationModal
        open={showCloseConfirmation}
        onOpenChange={(open) => setShowCloseConfirmation(open)}
        onKeepEditing={() => setShowCloseConfirmation(false)}
        onConfirmClose={confirmClose}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        open={!!editCardId}
        onOpenChange={(open) => !open && setEditCardId(null)}
        card={editCard || null}
        projectColor={projectColor}
        projectForegroundColor={projectForegroundColor}
      />
    </div>
  );
}

import { useFetcher } from "react-router";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface NewCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  projectColor: string;
  projectForegroundColor: string;
  front: string;
  back: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  actionError?: string;
  actionIntent?: string;
}

export function NewCardModal({
  open,
  onOpenChange,
  onClose,
  projectColor,
  projectForegroundColor,
  front,
  back,
  onFrontChange,
  onBackChange,
  actionError,
  actionIntent,
}: NewCardModalProps) {
  const fetcher = useFetcher();
  const isValid = front.trim() !== "" && back.trim() !== "";

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        // Only allow closing via explicit actions
        if (!open) return;
      }}
    >
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4 relative"
          style={{
            backgroundColor: `${projectColor}20`,
            borderBottom: `2px solid ${projectColor}`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: projectForegroundColor }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <DialogTitle className="text-2xl font-bold pr-10" style={{ color: projectForegroundColor }}>
            ✨ Add New Card
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {actionError && (actionIntent === "createCard" || actionIntent === "createCardAndNew") && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <span className="font-semibold">Oops!</span> {actionError}
            </div>
          )}

          <fetcher.Form method="post" className="space-y-4" data-card-form="true">
            <input type="hidden" name="intent" value="createCard" />

            <div>
              <label htmlFor="front" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Question 🤔
              </label>
              <textarea
                id="front"
                name="front"
                placeholder="What's on the front of your card?"
                rows={3}
                maxLength={200}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm"
                required
                autoFocus
                key={fetcher.state}
                value={front}
                onChange={(e) => onFrontChange(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">Max 200 characters</div>
            </div>

            <div>
              <label htmlFor="back" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Answer 💡
              </label>
              <textarea
                id="back"
                name="back"
                placeholder="What's the answer?"
                rows={3}
                maxLength={200}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm"
                required
                key={fetcher.state}
                value={back}
                onChange={(e) => onBackChange(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">Max 200 characters</div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="sm:flex-shrink-0 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                name="intent"
                value="createCardAndNew"
                disabled={!isValid || fetcher.state === "submitting"}
                className="flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isValid ? "white" : "#f3f4f6",
                  color: isValid ? "#7c3aed" : "#9ca3af",
                  borderColor: isValid ? "#a78bfa" : "#d1d5db",
                }}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {fetcher.state === "submitting" ? "Adding..." : "Add Another"}
                </span>
              </button>
              <button
                type="submit"
                name="intent"
                value="createCard"
                disabled={!isValid || fetcher.state === "submitting"}
                className="flex-1 px-3 py-2.5 text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isValid ? projectColor : "#d1d5db",
                  color: isValid ? projectForegroundColor : "#6b7280",
                }}
              >
                <span>{fetcher.state === "submitting" ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </fetcher.Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

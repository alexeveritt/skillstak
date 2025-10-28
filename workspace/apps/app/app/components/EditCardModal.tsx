import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "react-router";
import { ModalHeader } from "./ModalHeader";
import { Dialog, DialogContent } from "./ui/dialog";

interface EditCardModalProps {
  card: {
    id: string;
    front: string;
    back: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectColor?: string;
  projectForegroundColor?: string;
}

export function EditCardModal({
  card,
  open,
  onOpenChange,
  projectColor = "#fef3c7",
  projectForegroundColor = "#78350f",
}: EditCardModalProps) {
  const { t } = useTranslation();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState("");

  // Check if both fields have content (trimmed)
  const isValid = front.trim() !== "" && back.trim() !== "";

  // Update form values when card changes
  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
      setError(""); // Clear any errors when card changes
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate both fields are filled
    if (!front.trim() || !back.trim()) {
      setError(t("editCardModal.errorRequired"));
      return;
    }

    // If validation passes, submit the form
    e.currentTarget.submit();
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <ModalHeader
          title={t("editCardModal.title")}
          onClose={() => onOpenChange(false)}
          projectColor={projectColor}
          projectForegroundColor={projectForegroundColor}
        />

        <div className="px-6 pb-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <span className="font-semibold">{t("editCardModal.error")}</span> {error}
            </div>
          )}

          <Form method="post" onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="cardId" value={card.id} />

            <div>
              <label htmlFor="edit-front" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {`${t("editCardModal.questionLabel")} 🤔`}
              </label>
              <textarea
                id="edit-front"
                name="front"
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  if (error) setError(""); // Clear error on change
                }}
                placeholder={t("editCardModal.questionPlaceholder")}
                rows={3}
                maxLength={200}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm"
                required
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1">{t("editCardModal.maxChars")}</div>
            </div>

            <div>
              <label htmlFor="edit-back" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t("editCardModal.answerLabel")}
              </label>
              <textarea
                id="edit-back"
                name="back"
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  if (error) setError(""); // Clear error on change
                }}
                placeholder={t("editCardModal.answerPlaceholder")}
                rows={3}
                maxLength={200}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm"
                required
              />
              <div className="text-xs text-gray-500 mt-1">{t("editCardModal.maxChars")}</div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="sm:flex-shrink-0 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300"
              >
                {t("editCardModal.cancel")}
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="flex-1 px-3 py-2.5 text-sm font-bold text-white rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isValid ? projectColor : "#d1d5db",
                  color: isValid ? projectForegroundColor : "#6b7280",
                }}
              >
                <span>{t("editCardModal.update")}</span>
              </button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

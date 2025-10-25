import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "react-router";
import { ModalHeader } from "./ModalHeader";
import { Dialog, DialogContent } from "./ui/dialog";

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCardModal({ open, onOpenChange }: AddCardModalProps) {
  const { t } = useTranslation();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState("");

  // Check if both fields have content (trimmed)
  const isValid = front.trim() !== "" && back.trim() !== "";

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFront("");
      setBack("");
      setError("");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate both fields are filled
    if (!front.trim() || !back.trim()) {
      setError(t("addCardModal.errorRequired"));
      return;
    }

    // If validation passes, submit the form
    e.currentTarget.submit();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <ModalHeader
          title={t("addCardModal.title")}
          onClose={() => handleOpenChange(false)}
          projectColor="#fef3c7"
          projectForegroundColor="#78350f"
        />

        <div className="px-6 pb-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <span className="font-semibold">{t("addCardModal.error")}</span> {error}
            </div>
          )}

          <Form method="post" onSubmit={handleSubmit} className="space-y-4 py-4">
            <input type="hidden" name="intent" value="create" />

            <div>
              <label htmlFor="new-front" className="block text-sm font-medium text-gray-700 mb-2">
                {t("addCardModal.frontLabel")}
              </label>
              <textarea
                id="new-front"
                name="front"
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  if (error) setError("");
                }}
                placeholder={t("addCardModal.frontPlaceholder")}
                rows={4}
                maxLength={200}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              <div className="text-xs text-gray-500 mt-1">{t("addCardModal.maxChars")}</div>
            </div>

            <div>
              <label htmlFor="new-back" className="block text-sm font-medium text-gray-700 mb-2">
                {t("addCardModal.backLabel")}
              </label>
              <textarea
                id="new-back"
                name="back"
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  if (error) setError("");
                }}
                placeholder={t("addCardModal.backPlaceholder")}
                rows={4}
                maxLength={200}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              <div className="text-xs text-gray-500 mt-1">{t("addCardModal.maxChars")}</div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300"
              >
                {t("addCardModal.cancel")}
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                  isValid ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-300 cursor-not-allowed opacity-60"
                }`}
              >
                {t("addCardModal.save")}
              </button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

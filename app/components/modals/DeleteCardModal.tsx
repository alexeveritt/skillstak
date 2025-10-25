import { Form } from "react-router";
import { ModalHeader } from "../ModalHeader";
import { Dialog, DialogContent, DialogDescription } from "../ui/dialog";
import { useTranslation } from "react-i18next";

interface Card {
  id: string;
  front: string;
  back: string;
}

interface DeleteCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onCancel: () => void;
}

export function DeleteCardModal({ open, onOpenChange, card, onCancel }: DeleteCardModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <ModalHeader
          title={t("deleteCardModal.title")}
          onClose={onCancel}
          projectColor="#fee2e2"
          projectForegroundColor="#991b1b"
        />

        <div className="px-6 pb-6 pt-4">
          <DialogDescription className="mb-4">
            {t("deleteCardModal.confirmText")}
          </DialogDescription>

          {card && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">{card.front}</p>
                <p className="text-sm text-red-600">{card.back}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t("deleteCardModal.cancel")}
                </button>
                <Form method="post" onSubmit={onCancel}>
                  <input type="hidden" name="intent" value="deleteCard" />
                  <input type="hidden" name="cardId" value={card.id} />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    {t("deleteCardModal.deleteButton")}
                  </button>
                </Form>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

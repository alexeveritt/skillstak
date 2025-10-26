import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useTranslation } from "react-i18next";

interface CloseConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeepEditing: () => void;
  onConfirmClose: () => void;
}

export function CloseConfirmationModal({
  open,
  onOpenChange,
  onKeepEditing,
  onConfirmClose,
}: CloseConfirmationModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("closeConfirmationModal.title")}</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-sm text-gray-600 mb-4">{t("closeConfirmationModal.description")}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onKeepEditing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300"
            >
              {t("closeConfirmationModal.keepEditing")}
            </button>
            <button
              onClick={onConfirmClose}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              {t("closeConfirmationModal.leaveAnyway")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

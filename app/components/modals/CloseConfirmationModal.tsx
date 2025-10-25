import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Leave without saving?</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Heads up! You've made some changes that haven't been saved yet. Want to go back and save them?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onKeepEditing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300"
            >
              Keep Editing
            </button>
            <button
              onClick={onConfirmClose}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Leave Anyway
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { ModalHeader } from "../ModalHeader";
import { Dialog, DialogContent } from "../ui/dialog";

interface Card {
  id: string;
  front: string;
  back: string;
}

interface ViewCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  projectColor: string;
  projectForegroundColor: string;
}

export function ViewCardModal({ open, onOpenChange, card, projectColor, projectForegroundColor }: ViewCardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <ModalHeader
          title="Card Details"
          onClose={() => onOpenChange(false)}
          projectColor={projectColor}
          projectForegroundColor={projectForegroundColor}
        />

        {card && (
          <div className="space-y-4 py-4 px-6 pb-6">
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
                <p className="whitespace-pre-wrap">{card.front}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Back</label>
              <div className="p-4 rounded-lg border-2 border-gray-300 bg-gray-50">
                <p className="whitespace-pre-wrap text-gray-800">{card.back}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

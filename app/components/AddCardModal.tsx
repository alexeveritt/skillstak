import { useState } from "react";
import { Form } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCardModal({ open, onOpenChange }: AddCardModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFront("");
      setBack("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
        </DialogHeader>
        <Form method="post" className="space-y-4 py-4">
          <input type="hidden" name="intent" value="create" />

          <div>
            <Label htmlFor="new-front" className="block text-sm font-medium text-gray-700 mb-2">
              Front of Card
            </Label>
            <textarea
              id="new-front"
              name="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the question or prompt..."
              rows={4}
              maxLength={200}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <div className="text-xs text-gray-500 mt-1">Max 200 characters</div>
          </div>

          <div>
            <Label htmlFor="new-back" className="block text-sm font-medium text-gray-700 mb-2">
              Back of Card
            </Label>
            <textarea
              id="new-back"
              name="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the answer or response..."
              rows={4}
              maxLength={200}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <div className="text-xs text-gray-500 mt-1">Max 200 characters</div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Card
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

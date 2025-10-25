import { useState } from "react";
import { Form } from "react-router";
import { ModalHeader } from "./ModalHeader";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface DeleteProjectModalProps {
  projectName: string;
}

export function DeleteProjectModal({ projectName }: DeleteProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const isValid = confirmName.trim().toLowerCase() === projectName.trim().toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    if (!isValid) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Delete Card Pack
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <ModalHeader
          title="Delete Card Pack"
          onClose={() => setOpen(false)}
          projectColor="#fee2e2"
          projectForegroundColor="#991b1b"
        />

        <div className="px-6 pb-6">
          <DialogDescription className="mb-4">
            {`This action cannot be undone. This will permanently delete the card pack ${projectName} and all its cards.`}
          </DialogDescription>

          <Form method="post" onSubmit={handleSubmit}>
            <input type="hidden" name="intent" value="delete" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmName">{`Please type ${projectName} to confirm`}</Label>
                <Input
                  id="confirmName"
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder="Enter card pack name"
                  className="mt-2"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!isValid}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Card Pack
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

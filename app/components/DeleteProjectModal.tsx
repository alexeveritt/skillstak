import { useState } from "react";
import { Form } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
          Delete Project
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Project</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project <strong>{projectName}</strong> and
            all its cards.
          </DialogDescription>
        </DialogHeader>
        <Form method="post" onSubmit={handleSubmit}>
          <input type="hidden" name="intent" value="delete" />
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmName">
                Please type <strong>{projectName}</strong> to confirm
              </Label>
              <Input
                id="confirmName"
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Enter project name"
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
                Delete Project
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

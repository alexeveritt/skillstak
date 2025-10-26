import { useState } from "react";
import { Form } from "react-router";
import { ModalHeader } from "./ModalHeader";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTranslation } from "react-i18next";

interface DeleteProjectModalProps {
  projectName: string;
}

export function DeleteProjectModal({ projectName }: DeleteProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const { t } = useTranslation();

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
          {t("deleteProjectModal.deleteButton")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <ModalHeader
          title={t("deleteProjectModal.title")}
          onClose={() => setOpen(false)}
          projectColor="#fee2e2"
          projectForegroundColor="#991b1b"
        />
        <div className="px-6 pb-6">
          <DialogDescription className="mb-4">{t("deleteProjectModal.description", { projectName })}</DialogDescription>
          <Form method="post" onSubmit={handleSubmit}>
            <input type="hidden" name="intent" value="delete" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmName">{t("deleteProjectModal.confirmLabel", { projectName })}</Label>
                <Input
                  id="confirmName"
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={t("deleteProjectModal.inputPlaceholder")}
                  className="mt-2"
                  autoComplete="off"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("deleteProjectModal.cancel")}
                </Button>
                <Button type="submit" variant="destructive" disabled={!isValid}>
                  {t("deleteProjectModal.confirm")}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

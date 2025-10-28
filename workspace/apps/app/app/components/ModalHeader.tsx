import { X } from "lucide-react";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import { useTranslation } from "react-i18next";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  projectColor?: string;
  projectForegroundColor?: string;
  showCloseButton?: boolean;
}

export function ModalHeader({
  title,
  onClose,
  projectColor,
  projectForegroundColor,
  showCloseButton = true,
}: ModalHeaderProps) {
  const headerStyle = projectColor
    ? {
        backgroundColor: `${projectColor}20`,
        borderBottom: `2px solid ${projectColor}`,
      }
    : undefined;

  const titleStyle = projectForegroundColor ? { color: projectForegroundColor } : undefined;
  const { t } = useTranslation();

  return (
    <DialogHeader className="px-6 pt-6 pb-4 relative" style={headerStyle}>
      <DialogTitle className="text-2xl font-bold pr-10" style={titleStyle}>
        {title}
      </DialogTitle>
      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={titleStyle}
          aria-label={t("modalHeader.close")}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </DialogHeader>
  );
}

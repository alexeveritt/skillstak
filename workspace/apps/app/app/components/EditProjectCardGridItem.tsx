import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface EditProjectCardGridItemProps {
  card: { id: string; front: string; back: string };
  projectColor: string;
  projectForegroundColor: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EditProjectCardGridItem({
  card,
  projectColor,
  projectForegroundColor,
  onView,
  onEdit,
  onDelete,
}: EditProjectCardGridItemProps) {
  const { t } = useTranslation();

  return (
    <div
      key={card.id}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col overflow-hidden border-2"
      style={{ borderColor: projectColor }}
    >
      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col" style={{ backgroundColor: `${projectColor}40` }}>
        <div className="mb-3 flex-1">
          <div
            className="font-semibold text-gray-800 mb-2 line-clamp-1"
            style={{ color: projectForegroundColor }}
            title={card.front}
          >
            {card.front}
          </div>
          <div className="text-gray-600 text-sm line-clamp-2" title={card.back}>
            {card.back}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="border-t border-gray-200 bg-white flex divide-x divide-gray-200">
        <button
          type="button"
          onClick={() => onView(card.id)}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          <span>{t("editProjectCardGridItem.view")}</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(card.id)}
          className="flex-1 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Pencil className="w-4 h-4" />
          <span>{t("editProjectCardGridItem.change")}</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          className="flex-1 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t("editProjectCardGridItem.delete")}</span>
        </button>
      </div>
    </div>
  );
}

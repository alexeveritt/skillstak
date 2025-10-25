import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface EditProjectCardListProps {
  cards: Array<{ id: string; front: string; back: string }>;
  projectColor: string;
  onAddCard: () => void;
  renderCard: (card: { id: string; front: string; back: string }) => React.ReactNode;
}

export function EditProjectCardList({ cards, projectColor, onAddCard, renderCard }: EditProjectCardListProps) {
  const { t } = useTranslation();
  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t("editProjectCardList.noCardsYet")}</h2>
        <p className="text-gray-600 mb-4">
          {t("editProjectCardList.startBuilding")}
        </p>
        <button
          onClick={onAddCard}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all hover:scale-105"
        >
          <span>{t("editProjectCardList.addFirstCard")}</span>
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">{t("editProjectCardList.allCards", { count: cards.length })}</h2>
        <button
          onClick={onAddCard}
          className="bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 font-semibold py-2 px-4 rounded-lg border border-green-300 hover:shadow-md hover:from-green-200 hover:to-emerald-300 transition-all flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>{t("editProjectCardList.addCard")}</span>
        </button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4">
        {cards.map(renderCard)}
      </div>
    </>
  );
}

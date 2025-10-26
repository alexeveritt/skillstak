import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export interface ProjectActionButtonsProps {
  stats: {
    due_now: number;
    next_due_at?: string | null;
  };
  formatNextReviewTime: (nextDueAt: string | null) => string | null;
}

export function ProjectActionButtons({ stats, formatNextReviewTime }: ProjectActionButtonsProps) {
  const { t } = useTranslation();

  if (stats.due_now > 0) {
    return (
      <div className="space-y-4 mb-6">
        {/* Spaced Repetition Review */}
        <Link
          to="review"
          className="block bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">{t("projectActionButtons.startReviewSession")}</span>
              </div>
              <div className="text-sm opacity-90">{t("projectActionButtons.cardsReady", { count: stats.due_now })}</div>
            </div>
            <div className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg shadow-md flex-shrink-0 hover:bg-blue-50 transition-colors">
              {t("projectActionButtons.start")}
            </div>
          </div>
        </Link>
        {/* Practice Mode */}
        <Link
          to="review?mode=practice"
          className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-lg font-bold mb-2">{t("projectActionButtons.practiceMode")}</div>
              <div className="text-xs opacity-90">{t("projectActionButtons.practiceDesc")}</div>
            </div>
            <div className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg shadow-md flex-shrink-0 hover:bg-purple-50 transition-colors">
              {t("projectActionButtons.start")}
            </div>
          </div>
        </Link>
      </div>
    );
  }
  // No cards due
  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <div className="text-lg font-bold text-gray-700 mb-2">{t("projectActionButtons.caughtUp")}</div>
        <div className="text-sm text-gray-600">
          {(() => {
            const nextReviewTime = formatNextReviewTime(stats?.next_due_at ?? null);
            if (nextReviewTime) {
              return (
                <>
                  {t("projectActionButtons.nextReview")} <strong>{nextReviewTime}</strong>.
                </>
              );
            } else if (stats?.next_due_at) {
              return <>You're all done for now. Come back later to review more cards.</>;
            } else {
              return <>You have no cards scheduled for review yet.</>;
            }
          })()}
        </div>
      </div>
      {/* Practice Mode */}
      <Link
        to="review?mode=practice"
        className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-lg font-bold mb-2">{t("projectActionButtons.practiceMode")}</div>
            <div className="text-sm opacity-90">{t("projectActionButtons.practiceDesc")}</div>
          </div>
          <div className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg shadow-md flex-shrink-0 hover:bg-purple-50 transition-colors">
            {t("projectActionButtons.start")}
          </div>
        </div>
      </Link>
    </div>
  );
}

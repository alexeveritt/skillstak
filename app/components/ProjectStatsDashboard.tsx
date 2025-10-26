import { useTranslation } from "react-i18next";

export interface ProjectStatsDashboardProps {
  stats: {
    total_cards: number;
    mastered_cards: number;
    learning_cards: number;
    new_cards: number;
    due_now: number;
  };
  projectColor: string;
  projectForegroundColor: string;
}

export function ProjectStatsDashboard({ stats, projectColor, projectForegroundColor }: ProjectStatsDashboardProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="rounded-xl p-5 shadow-md"
          style={{ backgroundColor: projectColor, color: projectForegroundColor }}
        >
          <div className="text-3xl font-bold">{stats.total_cards}</div>
          <div className="text-sm font-medium mt-1 opacity-80">{`📚 ${t("projectStats.totalCards")}`}</div>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-5 shadow-md">
          <div className="text-3xl font-bold text-red-700">{stats.due_now}</div>
          <div className="text-sm font-medium text-red-600 mt-1">{`🔥 ${t("projectStats.readyNow")}`}</div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-5 shadow-md">
          <div className="text-3xl font-bold text-green-700">{stats.mastered_cards}</div>
          <div className="text-sm font-medium text-green-600 mt-1">{`⭐ ${t("projectStats.mastered")}`}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-5 shadow-md">
          <div className="text-3xl font-bold text-yellow-700">{stats.learning_cards}</div>
          <div className="text-sm font-medium text-yellow-600 mt-1">{`📖 ${t("projectStats.learning")}`}</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <div className="text-sm font-semibold text-gray-700 mb-3">{t("projectStats.yourProgress")}</div>
        <div className="flex items-center gap-2 h-8 bg-gray-200 rounded-full overflow-hidden">
          {stats.mastered_cards > 0 && (
            <div
              className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(stats.mastered_cards / stats.total_cards) * 100}%` }}
            >
              {stats.mastered_cards > 0 &&
                Math.round((stats.mastered_cards / stats.total_cards) * 100) > 10 &&
                `${Math.round((stats.mastered_cards / stats.total_cards) * 100)}%`}
            </div>
          )}
          {stats.learning_cards > 0 && (
            <div
              className="bg-yellow-400 h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(stats.learning_cards / stats.total_cards) * 100}%` }}
            >
              {stats.learning_cards > 0 &&
                Math.round((stats.learning_cards / stats.total_cards) * 100) > 10 &&
                `${Math.round((stats.learning_cards / stats.total_cards) * 100)}%`}
            </div>
          )}
          {stats.new_cards > 0 && (
            <div
              className="bg-purple-400 h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(stats.new_cards / stats.total_cards) * 100}%` }}
            >
              {stats.new_cards > 0 &&
                Math.round((stats.new_cards / stats.total_cards) * 100) > 10 &&
                `${Math.round((stats.new_cards / stats.total_cards) * 100)}%`}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">{`⭐ ${t("projectStats.mastered")}`}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-600">{`📖 ${t("projectStats.learning")}`}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-400 rounded"></div>
            <span className="text-gray-600">{t("projectStats.new")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

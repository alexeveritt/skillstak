// app/components/ProjectCard.tsx
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

type Props = {
  id: string;
  name: string;
  total: number;
  due: number;
};

export function ProjectCard({ id, name, total, due }: Props) {
  const { t } = useTranslation();
  return (
    <li className="border rounded p-3 flex items-center justify-between">
      <div>
        <Link to={`/p/${id}`} className="font-medium underline">
          {name}
        </Link>
        <div className="text-sm text-slate-600">
          {t("projectCard.due", { count: due })} -{" "}
          {t("projectCard.cards", { count: total })}
        </div>
      </div>
      <Link to={`/p/${id}/review`} className="text-sm underline">
        {t("projectCard.practice")}
      </Link>
    </li>
  );
}

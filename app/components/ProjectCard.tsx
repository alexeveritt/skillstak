// app/components/ProjectCard.tsx
import { Link } from "react-router";

type Props = {
  id: string;
  name: string;
  total: number;
  due: number;
};

export function ProjectCard({ id, name, total, due }: Props) {
  return (
    <li className="border rounded p-3 flex items-center justify-between">
      <div>
        <Link to={`/p/${id}`} className="font-medium underline">{name}</Link>
        <div className="text-sm text-slate-600">{due} due · {total} cards</div>
      </div>
      <Link to={`/p/${id}/review`} className="text-sm underline">Practice</Link>
    </li>
  );
}

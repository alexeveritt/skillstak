import { Edit, MoreVertical } from "lucide-react";
import { Link } from "react-router";

interface EditMenuProps {
  projectId: string;
  onMenuClick?: (e: React.MouseEvent) => void;
}

export function EditMenu({ projectId, onMenuClick }: EditMenuProps) {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMenuClick?.(e);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative group/menu flex-shrink-0">
      <button
        onClick={handleButtonClick}
        className="p-2 hover:bg-accent rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
        aria-label="Card Pack options"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      <div className="absolute right-0 top-full mt-1 w-48 bg-background rounded-lg shadow-lg border opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
        <Link
          to={`/p/${projectId}/edit`}
          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent rounded-t-lg transition-colors"
          onClick={handleLinkClick}
        >
          <Edit className="h-4 w-4" />
          Manage Card Pack
        </Link>
      </div>
    </div>
  );
}

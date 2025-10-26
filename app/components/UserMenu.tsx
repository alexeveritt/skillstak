import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, useMatches } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function UserMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const matches = useMatches();

  // Check if we're on a project-related page
  const projectMatch = matches.find((match) => match.id.includes("p.$projectId"));
  const projectData = projectMatch?.data as { project?: { id: string; name: string } } | undefined;
  const project = projectData?.project;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownMenu>
      <div ref={menuRef}>
        <DropdownMenuTrigger
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          aria-label={t("userMenu.ariaLabel")}
        >
          <User className="w-5 h-5 text-white" />
        </DropdownMenuTrigger>

        {isOpen && (
          <DropdownMenuContent align="end">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <DropdownMenuItem>
                <span className="font-medium">{t("userMenu.myCardPacks")}</span>
              </DropdownMenuItem>
            </Link>

            {project && (
              <>
                <DropdownMenuSeparator />
                <Link to={`/p/${project.id}`} onClick={() => setIsOpen(false)}>
                  <DropdownMenuItem>
                    <span>{t("userMenu.cardPackHome")}</span>
                  </DropdownMenuItem>
                </Link>
                <Link to={`/p/${project.id}/review?mode=practice`} onClick={() => setIsOpen(false)}>
                  <DropdownMenuItem>
                    <span>{t("userMenu.quickPractice")}</span>
                  </DropdownMenuItem>
                </Link>
                <Link to={`/p/${project.id}/edit`} onClick={() => setIsOpen(false)}>
                  <DropdownMenuItem>
                    <span>{t("userMenu.manageCardPack")}</span>
                  </DropdownMenuItem>
                </Link>
              </>
            )}

            <DropdownMenuSeparator />
            <Form method="post" action="/logout">
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-left text-red-600 hover:text-red-700">
                  {t("userMenu.logOut")}
                </button>
              </DropdownMenuItem>
            </Form>
          </DropdownMenuContent>
        )}
      </div>
    </DropdownMenu>
  );
}

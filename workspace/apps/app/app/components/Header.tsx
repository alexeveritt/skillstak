// app/components/Header.tsx

import { BookOpen, Sparkles } from "lucide-react";
import { NavLink } from "react-router";
import { UserMenu } from "~/components/UserMenu";
import { Button } from "~/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function Header({ userId }: { userId?: string | null }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-blue-50/95 supports-[backdrop-filter]:via-purple-50/95 supports-[backdrop-filter]:to-pink-50/95 dark:supports-[backdrop-filter]:from-blue-950/95 dark:supports-[backdrop-filter]:via-purple-950/95 dark:supports-[backdrop-filter]:to-pink-950/95 shadow-sm">
      <div className="mx-auto max-w-3xl p-4 flex items-center justify-between">
        <NavLink
          to="/"
          className="font-bold text-xl flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 absolute -top-1 -right-1" />
          </div>
          {t("header.skillstak")}
        </NavLink>
        <nav className="flex gap-2 text-sm items-center">
          {userId ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <NavLink to="/login">{t("header.login")}</NavLink>
              </Button>
              <Button
                size="sm"
                className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                asChild
              >
                <NavLink to="/signup">{t("header.signup")}</NavLink>
              </Button>
            </>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

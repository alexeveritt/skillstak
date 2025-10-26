import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Tooltip } from "~/components/ui/tooltip";

// Language configuration - easy to extend with new languages
const LANGUAGES = [
  { code: "en", flag: "🇬🇧", nameKey: "languageSwitcher.english" },
  { code: "pt-PT", flag: "🇵🇹", nameKey: "languageSwitcher.portuguese" },
  { code: "fr", flag: "🇫🇷", nameKey: "languageSwitcher.french" },
  { code: "de", flag: "🇩🇪", nameKey: "languageSwitcher.german" },
  { code: "da", flag: "🇩🇰", nameKey: "languageSwitcher.danish" },
  { code: "es", flag: "🇪🇸", nameKey: "languageSwitcher.spanish" },
  { code: "sv", flag: "🇸🇪", nameKey: "languageSwitcher.swedish" },
] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <DropdownMenu>
      <Tooltip content={t(currentLanguage.nameKey)} side="bottom">
        <DropdownMenuTrigger
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl hover:opacity-80 transition-opacity focus:ring-2 focus:ring-purple-500 rounded p-1"
          aria-label={`Current language: ${t(currentLanguage.nameKey)}`}
        >
          {currentLanguage.flag}
        </DropdownMenuTrigger>
      </Tooltip>
      {isOpen && (
        <DropdownMenuContent align="end" onMouseLeave={() => setIsOpen(false)}>
          {LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className="text-xl">{language.flag}</span>
              <span className="flex-1">{t(language.nameKey)}</span>
              {currentLanguage.code === language.code && <Check className="w-4 h-4 text-purple-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

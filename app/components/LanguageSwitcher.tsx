import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        Language:
      </label>
      <select
        id="language-select"
        value={i18n.language}
        onChange={handleChange}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="en">English</option>
        <option value="pt-PT">Português</option>
      </select>
    </div>
  );
}

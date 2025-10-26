import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        {i18n.t("languageSwitcher.label")}
      </label>
      <select
        id="language-select"
        value={i18n.language}
        onChange={handleChange}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="en">{i18n.t("languageSwitcher.english")}</option>
        <option value="pt-PT">{i18n.t("languageSwitcher.portuguese")}</option>
        <option value="fr">{i18n.t("languageSwitcher.french")}</option>
        <option value="de">{i18n.t("languageSwitcher.german")}</option>
        <option value="da">{i18n.t("languageSwitcher.danish")}</option>
        <option value="es">{i18n.t("languageSwitcher.spanish")}</option>
        <option value="sv">{i18n.t("languageSwitcher.swedish")}</option>
      </select>
    </div>
  );
}

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ptPT from "../locales/pt-PT.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import da from "../locales/da.json";
import es from "../locales/es.json";
import sv from "../locales/sv.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "pt-PT": { translation: ptPT },
      fr: { translation: fr },
      de: { translation: de },
      da: { translation: da },
      es: { translation: es },
      sv: { translation: sv },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "pt-PT", "fr", "de", "da", "es", "sv"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;

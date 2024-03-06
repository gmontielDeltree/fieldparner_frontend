import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// import XHR from 'i18next-xhr-backend';
import { } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import translationES from '../public/locales/es/translation.json';
import translationEN from '../public/locales/en/translation.json';
import translationPT from '../public/locales/pt/translation.json';
// the translations
const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  },
  pt: {
    translation: translationPT
  }
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    debug: true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

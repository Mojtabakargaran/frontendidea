import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import faTranslations from './fa.json';
import arTranslations from './ar.json';

const resources = {
  fa: {
    translation: faTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

const isClient = typeof window !== 'undefined';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fa', // Default to Persian
    fallbackLng: 'fa',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable Suspense to avoid SSR issues
    },
  });

// Only use language detector on client side
if (isClient) {
  i18n.use(LanguageDetector);
  i18n.init({
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });
}

export default i18n;

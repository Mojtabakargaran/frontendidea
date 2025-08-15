import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import faTranslations from './fa.json';
import arTranslations from './ar.json';
import enTranslations from './en.json';

const resources = {
  fa: {
    translation: faTranslations,
  },
  ar: {
    translation: arTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

const isClient = typeof window !== 'undefined';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Always start with English for SSR consistency
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable Suspense to avoid SSR issues
    },
  });

export default i18n;

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Utility function to ensure language persistence across page navigations
 */
export const useLanguagePersistence = () => {
  const { i18n } = useTranslation();

  /**
   * Initialize language from localStorage if available
   */
  const initializeLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n]);

  /**
   * Save current language to localStorage
   */
  const saveLanguage = useCallback((languageCode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', languageCode);
    }
  }, []);

  /**
   * Change language and save it to localStorage
   */
  const changeLanguage = useCallback((languageCode: string) => {
    saveLanguage(languageCode);
    i18n.changeLanguage(languageCode);
    
    // Update document direction and font class
    const dir = languageCode === 'fa' || languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    
    const fontClass = languageCode === 'fa' || languageCode === 'ar' ? 'font-persian' : 'font-english';
    document.documentElement.className = fontClass;
  }, [i18n, saveLanguage]);

  /**
   * Apply language styles to document
   */
  const applyLanguageStyles = useCallback((languageCode: string = i18n.language) => {
    const dir = languageCode === 'fa' || languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    
    const fontClass = languageCode === 'fa' || languageCode === 'ar' ? 'font-persian' : 'font-english';
    document.documentElement.className = fontClass;
  }, [i18n.language]);

  return {
    initializeLanguage,
    saveLanguage,
    changeLanguage,
    applyLanguageStyles,
  };
};

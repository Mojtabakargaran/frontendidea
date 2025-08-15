import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Utility function to ensure language persistence across page navigations
 */
export const useLanguagePersistence = () => {
  const { i18n } = useTranslation();

  /**
   * Apply language styles to document
   */
  const applyLanguageStyles = useCallback((languageCode: string = i18n.language) => {
    const dir = languageCode === 'fa' || languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    
    const fontClass = languageCode === 'fa' || languageCode === 'ar' ? 'font-persian' : 'font-english';
    document.documentElement.className = fontClass;
  }, [i18n.language]);

  /**
   * Initialize language from localStorage if available
   * This should be called after the component is mounted to avoid SSR/CSR mismatch
   */
  const initializeLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('i18nextLng');
      const currentPath = window.location.pathname;
      
      // Special case: if on auth pages and coming from English, switch to Arabic
      if ((currentPath === '/login' || currentPath.startsWith('/auth/')) && 
          (!savedLanguage || savedLanguage === 'en')) {
        const newLanguage = 'ar';
        localStorage.setItem('i18nextLng', newLanguage);
        if (newLanguage !== i18n.language) {
          i18n.changeLanguage(newLanguage);
        }
        applyLanguageStyles(newLanguage);
        return;
      }
      
      if (savedLanguage && ['fa', 'ar', 'en'].includes(savedLanguage)) {
        // Only change language if it's different from current
        if (savedLanguage !== i18n.language) {
          i18n.changeLanguage(savedLanguage);
        }
        // Apply styles for the detected language
        applyLanguageStyles(savedLanguage);
      } else {
        // If no saved language, apply styles for current language (English)
        applyLanguageStyles(i18n.language);
      }
    }
  }, [i18n, applyLanguageStyles]);

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
   * Handle navigation to auth pages with special language logic
   * If currently on English, switch to Arabic for auth pages
   */
  const navigateToAuthPage = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      const currentLanguage = i18n.language;
      
      // If currently English and navigating to auth pages, switch to Arabic
      if (currentLanguage === 'en' && (url === '/login' || url.startsWith('/auth/'))) {
        changeLanguage('ar');
      }
      
      // Navigate after language change
      window.location.href = url;
    }
  }, [i18n.language, changeLanguage]);

  return {
    initializeLanguage,
    saveLanguage,
    changeLanguage,
    applyLanguageStyles,
    navigateToAuthPage,
  };
};

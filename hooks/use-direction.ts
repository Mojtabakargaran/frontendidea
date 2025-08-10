'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const direction = i18n.language === 'fa' || i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    
    // Update font class based on language
    const fontClass = i18n.language === 'fa' || i18n.language === 'ar' ? 'font-persian' : 'font-english';
    document.documentElement.className = fontClass;
  }, [i18n.language]);

  return i18n.language === 'fa' || i18n.language === 'ar' ? 'rtl' : 'ltr';
}

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLanguagePersistence } from '@/hooks/use-language-persistence';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const { changeLanguage } = useLanguagePersistence();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fa', name: t('ui.languageSelector.persian'), nativeName: 'فارسی' },
    { code: 'ar', name: t('ui.languageSelector.arabic'), nativeName: 'عربي' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  // Don't render during SSR to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
      <Globe className="h-5 w-5 text-gray-600" />
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              i18n.language === language.code
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30'
            }`}
          >
            {language.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}

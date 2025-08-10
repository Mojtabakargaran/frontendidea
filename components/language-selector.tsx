'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguagePersistence } from '@/hooks/use-language-persistence';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const { changeLanguage } = useLanguagePersistence();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const languages = [
    { code: 'fa', name: t('ui.languageSelector.persian'), nativeName: 'فارسی' },
    { code: 'ar', name: t('ui.languageSelector.arabic'), nativeName: 'عربي' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Don't render during SSR to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className={className}>
        <div className="w-auto min-w-[140px] h-10 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">فارسی</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-auto min-w-[140px] bg-white/95 backdrop-blur-sm border-white/30 hover:bg-white transition-all duration-300 rounded-xl">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <SelectValue placeholder={currentLanguage.nativeName}>
              {currentLanguage.nativeName}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-sm border-white/30 rounded-xl">{/* rest of the content */}
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-gray-500 text-sm">({language.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

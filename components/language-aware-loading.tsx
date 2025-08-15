'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A component that shows static loading text during SSR/mounting
 * and switches to translated text after hydration to prevent mismatches
 */
export default function LanguageAwareLoading() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="text-lg">
      {mounted ? t('common.loading') : 'Loading...'}
    </div>
  );
}

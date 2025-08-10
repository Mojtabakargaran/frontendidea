'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';

import MandatoryPasswordChangeForm from '@/components/mandatory-password-change-form';
import LanguageSelector from '@/components/language-selector';
import ErrorBoundary from '@/components/error-boundary';
import { useLanguagePersistence } from '@/hooks/use-language-persistence';
import '@/i18n';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function MandatoryPasswordChangePage() {
  const { t, i18n } = useTranslation();
  const { initializeLanguage, applyLanguageStyles } = useLanguagePersistence();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Get token from URL parameters
  const token = searchParams.get('token');

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize language once when component mounts
  useEffect(() => {
    if (mounted) {
      // Initialize language from localStorage
      initializeLanguage();
    }
  }, [mounted, initializeLanguage]);

  // Apply language styles when language changes
  useEffect(() => {
    if (mounted) {
      applyLanguageStyles();
    }
  }, [i18n.language, mounted, applyLanguageStyles]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen animated-gradient relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          {/* Decorative background elements */}
          <div className="decorative-blob blob-1"></div>
          <div className="decorative-blob blob-2"></div>
          
          <div className="max-w-md w-full space-y-8 relative z-10">
            {/* Language Selector */}
            <div className="flex justify-center">
              <div className="glass-overlay rounded-xl p-2">
                <LanguageSelector />
              </div>
            </div>

            {/* Mandatory Password Change Form */}
            <MandatoryPasswordChangeForm token={token || undefined} />

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-white/80 backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 inline-block">
                © 2025 Samanin. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

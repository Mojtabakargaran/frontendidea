'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import PasswordResetForm from '@/components/password-reset-form';
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

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const { initializeLanguage, applyLanguageStyles } = useLanguagePersistence();
  const [mounted, setMounted] = useState(false);

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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleResetSuccess = (data: any) => {
    console.log('Password reset request successful:', data);
  };

  const handleResetError = (error: any) => {
    console.error('Password reset error:', error);
  };

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

            {/* Password Reset Form */}
            <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 mb-4 floating">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('auth.passwordReset.request.title')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('auth.passwordReset.request.subtitle')}
                </p>
              </div>

              <PasswordResetForm
                onSuccess={handleResetSuccess}
                onError={handleResetError}
              />
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600 backdrop-blur-sm bg-white/20 rounded-full px-4 py-2 inline-block">
                © 2025 Samanin. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

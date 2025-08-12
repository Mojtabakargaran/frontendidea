'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import LoginForm from '@/components/login-form';
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

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { initializeLanguage, applyLanguageStyles } = useLanguagePersistence();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
    
    // Clear any cached session data when accessing login page
    sessionStorage.removeItem('user');
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

  const handleLoginSuccess = (data: any) => {
    // Success is handled by the form component (redirect)
    console.log('Login successful:', data);
  };

  const handleLoginError = (error: any) => {
    // Error handling is done by the form component
    console.error('Login error:', error);
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

            {/* Login Form */}
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold gradient-title">
                  {t('auth.login.title')}
                </h2>
                <p className="gradient-text-navy mt-2">
                  {t('auth.login.subtitle')}
                </p>
              </div>

              <LoginForm
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
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

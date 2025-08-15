'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

import RegistrationForm from '@/components/registration-form';
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

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { initializeLanguage, applyLanguageStyles, saveLanguage } = useLanguagePersistence();
  const [mounted, setMounted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  const handleRegistrationSuccess = (data: any) => {
    console.log('Registration successful:', data);
    setSuccessMessage(t('auth.registration.messages.success'));
    
    setTimeout(() => {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }, 2000);
  };

  const handleRegistrationError = (error: any) => {
    console.error('Registration error:', error);
    setSuccessMessage('');
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

            {/* Registration Form */}
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold gradient-title">
                  {t('auth.registration.title')}
                </h1>
                <p className="mt-4 gradient-text-navy">
                  {t('auth.registration.subtitle')}
                </p>
              </div>

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-green-800 text-sm">
                    {successMessage}
                  </div>
                  {isRedirecting && (
                    <div className="text-green-600 text-xs mt-1">
                      {t('auth.registration.messages.redirecting')}
                    </div>
                  )}
                </div>
              )}

              <RegistrationForm 
                onSuccess={handleRegistrationSuccess} 
                onError={handleRegistrationError} 
              />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

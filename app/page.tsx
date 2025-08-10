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
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  const handleRegistrationSuccess = (data: any) => {
    // Show success message based on response code
    const messageKey = data.code === 'auth.REGISTRATION_SUCCESS_EMAIL_DELAYED' 
      ? 'auth.registration.messages.successEmailDelayed'
      : 'auth.registration.messages.success';
    
    setSuccessMessage(t(messageKey));
    
    // Start redirect countdown
    setIsRedirecting(true);
    
    // Ensure language is saved before redirecting
    saveLanguage(i18n.language);
    
    setTimeout(() => {
      // Use Next.js router for navigation to maintain client-side routing
      router.push('/login');
    }, 3000);
  };

  const handleRegistrationError = (error: any) => {
    console.error('Registration error:', error);
    // Error handling is done within the form component
  };

  // Success state - show success message and redirect
  if (successMessage) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen animated-gradient relative overflow-hidden flex flex-col justify-center">
          {/* Decorative background elements */}
          <div className="decorative-blob blob-1"></div>
          <div className="decorative-blob blob-2"></div>
          
          <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
            {/* Language Selector */}
            <div className="flex justify-center mb-6">
              <div className="glass-overlay rounded-xl p-2">
                <LanguageSelector />
              </div>
            </div>

            {/* Success Message */}
            <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 floating">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mb-6 pulse-glow">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  {t('auth.registration.messages.success')}
                </h2>
                
                <p className="text-gray-700 mb-6 text-lg">
                  {successMessage}
                </p>
                
                {isRedirecting && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-blue-600 text-sm">
                      {t('auth.registration.messages.redirecting')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  // Registration form state
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen animated-gradient relative overflow-hidden flex flex-col justify-center py-8 px-6">
          {/* Decorative background elements */}
          <div className="decorative-blob blob-1"></div>
          <div className="decorative-blob blob-2"></div>
          <div className="decorative-blob blob-3"></div>
          
          <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
            {/* Language Selector */}
            <div className="flex justify-center mb-6">
              <div className="glass-overlay rounded-xl p-2">
                <LanguageSelector />
              </div>
            </div>

            {/* Registration Form */}
            <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4 floating">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('auth.registration.title')}
                </h2>
                <p className="text-base text-gray-800 mt-2">
                  {t('auth.registration.subtitle')}
                </p>
              </div>

              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-white/80 backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 inline-block">
                © 2025 Samanin. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

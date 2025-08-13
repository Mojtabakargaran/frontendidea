'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Github, Users, BookOpen, LogIn, UserPlus, Globe, Eye } from 'lucide-react';
import Link from 'next/link';

import LanguageToggle from '@/components/language-toggle';
import ErrorBoundary from '@/components/error-boundary';
import { useLanguagePersistence } from '@/hooks/use-language-persistence';
import '@/i18n';

export default function LandingPage() {
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
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen animated-gradient relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="decorative-blob blob-1"></div>
        <div className="decorative-blob blob-2"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Language Toggle */}
          <div className="flex justify-center mb-12">
            <div className="glass-overlay rounded-xl p-4">
              <LanguageToggle />
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6 floating">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight">
                  {t('landing.title')}
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  {t('landing.subtitle')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login" className="dashboard-button-primary rounded-xl px-8 py-4 min-h-[52px] flex items-center space-x-2 rtl:space-x-reverse">
                  <LogIn className="h-5 w-5" />
                  <span>{t('landing.actions.login')}</span>
                </Link>
                <Link href="/auth/register" className="dashboard-button-secondary rounded-xl px-8 py-4 min-h-[52px] flex items-center space-x-2 rtl:space-x-reverse">
                  <UserPlus className="h-5 w-5" />
                  <span>{t('landing.actions.register')}</span>
                </Link>
              </div>
            </div>

            {/* Features Overview */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  {t('landing.features.title')}
                </h2>
                <p className="text-lg dashboard-text-secondary max-w-3xl mx-auto">
                  {t('landing.features.description')}
                </p>
              </div>
            </div>

            {/* Sample Users Section */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  {t('landing.sampleUsers.title')}
                </h2>
                <p className="text-lg dashboard-text-secondary mb-8">
                  {t('landing.sampleUsers.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Persian User */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold dashboard-text-primary mb-3">
                    {t('landing.sampleUsers.persian')}
                  </h3>
                  <div className="space-y-2 text-sm dashboard-text-secondary">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-medium">{t('common.email')}:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">ali.ahmadi@parsi.com</code>
                    </div>
                  </div>
                </div>

                {/* Arabic User */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <h3 className="text-lg font-semibold dashboard-text-primary mb-3">
                    {t('landing.sampleUsers.arabic')}
                  </h3>
                  <div className="space-y-2 text-sm dashboard-text-secondary">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-medium">{t('common.email')}:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">ahmed.alsaadi@emirate.ae</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm dashboard-text-secondary">
                    <span className="font-medium">{t('landing.sampleUsers.password')}:</span>
                    <code className="bg-white px-2 py-1 rounded text-gray-800 mx-2">SamplePass123!</code>
                  </p>
                  <p className="text-xs dashboard-text-muted mt-2">
                    {t('landing.sampleUsers.note')}
                  </p>
                </div>
                <Link href="/login" className="dashboard-button-primary rounded-xl px-6 py-3 inline-flex items-center space-x-2 rtl:space-x-reverse">
                  <Eye className="h-4 w-4" />
                  <span>{t('landing.actions.tryDemo')}</span>
                </Link>
              </div>
            </div>

            {/* GitHub Links Section */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 mb-4">
                  <Github className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  {t('landing.github.title')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Backend Repository */}
                <a
                  href="https://github.com/Mojtabakargaran/backendidea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold dashboard-text-primary">
                      {t('landing.github.backend')}
                    </h3>
                    <ExternalLink className="h-5 w-5 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-sm dashboard-text-secondary">Node.js • NestJS • TypeScript • PostgreSQL</p>
                </a>

                {/* Frontend Repository */}
                <a
                  href="https://github.com/Mojtabakargaran/frontendidea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold dashboard-text-primary">
                      {t('landing.github.frontend')}
                    </h3>
                    <ExternalLink className="h-5 w-5 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-sm dashboard-text-secondary">Next.js • React • TypeScript • TailwindCSS</p>
                </a>
              </div>

              {/* Feature Documentation Links */}
              <div className="border-t border-white/30 pt-8">
                <h3 className="text-xl font-semibold dashboard-text-primary mb-6 text-center">
                  {t('landing.github.features')}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <a
                    href="https://github.com/Mojtabakargaran/backendidea/blob/main/FullFeaturesEN.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/30 hover:bg-white/60 transition-all duration-200 group flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BookOpen className="h-4 w-4 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium dashboard-text-secondary">English Features</span>
                    <ExternalLink className="h-3 w-3 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                  </a>
                  
                  <a
                    href="https://github.com/Mojtabakargaran/backendidea/blob/main/FullFeaturesFA.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/30 hover:bg-white/60 transition-all duration-200 group flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BookOpen className="h-4 w-4 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium dashboard-text-secondary">Persian Features</span>
                    <ExternalLink className="h-3 w-3 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                  </a>
                  
                  <a
                    href="https://github.com/Mojtabakargaran/backendidea/blob/main/FullFeaturesAR.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/30 hover:bg-white/60 transition-all duration-200 group flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BookOpen className="h-4 w-4 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium dashboard-text-secondary">Arabic Features</span>
                    <ExternalLink className="h-3 w-3 dashboard-text-muted group-hover:text-blue-600 transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {/* Language Note */}
            <div className="text-center">
              <div className="glass-overlay rounded-xl p-6 max-w-4xl mx-auto">
                <p className="text-sm dashboard-text-muted leading-relaxed">
                  {t('landing.languages.note')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

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

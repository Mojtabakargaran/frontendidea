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
  const { initializeLanguage, applyLanguageStyles, navigateToAuthPage } = useLanguagePersistence();
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
                <h1 className="text-5xl md:text-6xl font-bold gradient-title leading-tight">
                  {t('landing.title')}
                </h1>
                <p className="text-xl md:text-2xl gradient-text-navy max-w-3xl mx-auto leading-relaxed">
                  {t('landing.subtitle')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => navigateToAuthPage('/login')}
                  className="dashboard-button-primary rounded-xl px-8 py-4 min-h-[52px] flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <LogIn className="h-5 w-5" />
                  <span>{t('landing.actions.login')}</span>
                </button>
                <button 
                  onClick={() => navigateToAuthPage('/auth/register')}
                  className="dashboard-button-secondary rounded-xl px-8 py-4 min-h-[52px] flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>{t('landing.actions.register')}</span>
                </button>
              </div>
            </div>

            {/* Features Overview */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold gradient-title mb-4">
                  {t('landing.features.title')}
                </h2>
                <p className="text-lg dashboard-text-secondary max-w-3xl mx-auto text-justify">
                  {t('landing.features.description')}
                </p>
              </div>
            </div>
            
            {/* GitHub Links Section */}
            <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 mb-4">
                  <Github className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold gradient-title mb-4">
                  {t('landing.github.title')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Backend Repository */}
                <a
                  href="https://github.com/Mojtabakargaran/backendidea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('landing.github.backend')}
                    </h3>
                    <ExternalLink className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Node.js • NestJS • TypeScript • PostgreSQL</p>
                </a>

                {/* Frontend Repository */}
                <a
                  href="https://github.com/Mojtabakargaran/frontendidea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('landing.github.frontend')}
                    </h3>
                    <ExternalLink className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Next.js • React • TypeScript • TailwindCSS</p>
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
                    className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-md hover:bg-white/85 hover:shadow-lg transition-all duration-200 group flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BookOpen className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                    <span className="text-sm font-medium text-gray-800">English Features</span>
                    <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  </a>
                  
                  <a
                    href="https://github.com/Mojtabakargaran/backendidea/blob/main/FullFeaturesFA.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-md hover:bg-white/85 hover:shadow-lg transition-all duration-200 group flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BookOpen className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                    <span className="text-sm font-medium text-gray-800">Persian Features</span>
                    <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  </a>
                  
                  <a
                    href="https://github.com/Mojtabakargaran/backendidea/blob/main/FullFeaturesAR.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-md hover:bg-white/85 hover:shadow-lg transition-all duration-200 group flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <BookOpen className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                    <span className="text-sm font-medium text-gray-800">Arabic Features</span>
                    <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gray-700 transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {/* Language Note */}
            <div className="text-center">
              <div className="glass-overlay rounded-xl p-6 max-w-4xl mx-auto">
                <p className="text-sm gradient-text-navy leading-relaxed">
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

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/api';
import { EmailVerificationResponse, ResendVerificationRequest, ApiError } from '@/types';
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

function VerifyEmailContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeLanguage, applyLanguageStyles, changeLanguage } = useLanguagePersistence();
  const token = searchParams.get('token');
  const langFromUrl = searchParams.get('lang'); // Get language from URL
  const [mounted, setMounted] = useState(false);
  
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize language once when component mounts
  useEffect(() => {
    if (mounted) {
      // Initialize language from localStorage or URL parameter
      if (langFromUrl && (langFromUrl === 'fa' || langFromUrl === 'ar')) {
        // Change language based on URL parameter from email
        changeLanguage(langFromUrl);
      } else {
        initializeLanguage();
      }
    }
  }, [mounted, langFromUrl, changeLanguage, initializeLanguage]); // Now using stable callback references

  // Apply language styles when language changes
  useEffect(() => {
    if (mounted) {
      applyLanguageStyles();
    }
  }, [i18n.language, mounted, applyLanguageStyles]);

  // Email verification query
  const {
    data: verificationData,
    error: verificationError,
    isLoading: isVerifying,
    isError: hasVerificationError,
  } = useQuery<EmailVerificationResponse, ApiError>({
    queryKey: ['emailVerification', token, langFromUrl],
    queryFn: () => authService.verifyEmail(token!, langFromUrl || undefined),
    enabled: !!token && mounted,
    retry: false,
  });

  // Resend verification mutation
  const resendMutation = useMutation<any, ApiError, ResendVerificationRequest>({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: () => {
      setResendSuccess(true);
      setShowResendForm(false);
    },
  });

  useEffect(() => {
    if (!token && mounted) {
      router.push('/login');
    }
  }, [token, router, mounted]);

  // Handle successful verification and language update
  useEffect(() => {
    if (verificationData?.data?.language) {
      // Update language based on backend response
      const backendLanguage = verificationData.data.language;
      if (backendLanguage !== i18n.language) {
        changeLanguage(backendLanguage);
      }
    }
  }, [verificationData, i18n.language, changeLanguage]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const getErrorMessage = (error: ApiError) => {
    switch (error.code) {
      case 'auth.INVALID_VERIFICATION_TOKEN':
        return t('auth.emailVerification.messages.invalidToken');
      case 'auth.EXPIRED_VERIFICATION_TOKEN':
        return t('auth.emailVerification.messages.expiredToken');
      case 'auth.EMAIL_ALREADY_VERIFIED':
        return t('auth.emailVerification.messages.alreadyVerified');
      case 'auth.TOO_MANY_VERIFICATION_ATTEMPTS':
        return t('auth.emailVerification.messages.tooManyAttempts');
      case 'errors.VERIFICATION_TEMPORARILY_UNAVAILABLE':
        return t('auth.emailVerification.messages.verificationUnavailable');
      default:
        return t('auth.emailVerification.messages.errorOccurred');
    }
  };

  const canShowResendOption = (error: ApiError) => {
    return ['auth.INVALID_VERIFICATION_TOKEN', 'auth.EXPIRED_VERIFICATION_TOKEN'].includes(error.code);
  };

  // Early return if no token without triggering router during render
  if (!token) {
    return null;
  }

  // Show loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen animated-gradient relative overflow-hidden flex items-center justify-center">
        <div className="decorative-blob blob-1"></div>
        <div className="decorative-blob blob-2"></div>
        <div className="relative z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  const handleResendEmail = async () => {
    if (!resendEmail) return;
    
    try {
      await resendMutation.mutateAsync({ email: resendEmail });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
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

        <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mb-4 floating">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {t('auth.emailVerification.title')}
            </h2>
            <p className="text-gray-600 mt-2">
              {isVerifying ? t('auth.emailVerification.subtitle') : ''}
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Loading State */}
            {isVerifying && (
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-600 text-center">
                  {t('auth.emailVerification.subtitle')}
                </p>
              </div>
            )}

            {/* Success State */}
            {verificationData && (
              <div className="flex flex-col items-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mb-4 floating">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-green-800">
                    {t('auth.emailVerification.messages.success')}
                  </h3>
                  <p className="text-gray-600">
                    {t('auth.emailVerification.messages.successSubtitle')}
                  </p>
                </div>
                <Button 
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('auth.emailVerification.buttons.goToLogin')}
                </Button>
              </div>
            )}

            {/* Error State */}
            {hasVerificationError && verificationError && (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <XCircle className="w-16 h-16 text-red-500" />
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-red-800">
                      {getErrorMessage(verificationError)}
                    </h3>
                  </div>
                </div>

                {/* Show resend option for certain errors */}
                {canShowResendOption(verificationError) && !showResendForm && (
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => setShowResendForm(true)}
                      variant="outline"
                      className="w-full"
                    >
                      {t('auth.emailVerification.buttons.resendEmail')}
                    </Button>
                    <Button
                      onClick={handleGoToLogin}
                      variant="ghost"
                      className="w-full"
                    >
                      {t('auth.emailVerification.buttons.goToLogin')}
                    </Button>
                  </div>
                )}

                {/* Show login button for already verified */}
                {verificationError.code === 'auth.EMAIL_ALREADY_VERIFIED' && (
                  <Button
                    onClick={handleGoToLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {t('auth.emailVerification.buttons.goToLogin')}
                  </Button>
                )}
              </div>
            )}

            {/* Resend Email Form */}
            {showResendForm && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('auth.emailVerification.resendForm.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('auth.emailVerification.resendForm.subtitle')}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resend-email">
                      {t('auth.emailVerification.resendForm.email.label')}
                    </Label>
                    <Input
                      id="resend-email"
                      type="email"
                      dir="ltr"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder={t('auth.emailVerification.resendForm.email.placeholder')}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleResendEmail}
                      disabled={!resendEmail || resendMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {resendMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t('auth.emailVerification.buttons.resending')}
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          {t('auth.emailVerification.resendForm.submit')}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowResendForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {t('auth.emailVerification.messages.verificationSent')}
                </span>
              </div>
            )}

            {/* Resend Error Message */}
            {resendMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {getErrorMessage(resendMutation.error)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-white/80 backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 inline-block">
            © 2025 Samanin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

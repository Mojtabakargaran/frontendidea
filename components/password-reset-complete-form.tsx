'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/api';
import { validatePassword } from '@/lib/utils';
import { useLanguagePersistence } from '@/hooks/use-language-persistence';
import type { PasswordResetCompleteRequest, PasswordResetCompleteResponse, ApiError } from '@/types';

// Form validation schema following ? requirements
const createPasswordResetCompleteSchema = (t: any) => z.object({
  password: z.string()
    .min(8, t('validation.password.minLength'))
    .refine((password) => validatePassword(password).isValid, {
      message: t('validation.password.policyViolation'),
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.password.confirmationMismatch'),
  path: ['confirmPassword'],
});

interface PasswordResetCompleteFormProps {
  token: string;
  language?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export default function PasswordResetCompleteForm({ 
  token, 
  language,
  onSuccess, 
  onError 
}: PasswordResetCompleteFormProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { changeLanguage } = useLanguagePersistence();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [resetResponse, setResetResponse] = useState<PasswordResetCompleteResponse | null>(null);

  const schema = createPasswordResetCompleteSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedPassword = watch('password');

  // TanStack Query mutation for password reset completion
  const passwordResetCompleteMutation = useMutation<PasswordResetCompleteResponse, ApiError, PasswordResetCompleteRequest>({
    mutationFn: authService.completePasswordReset,
    onSuccess: (data) => {
      setFormError('');
      setSuccessMessage(t('auth.passwordReset.complete.messages.success'));
      setResetResponse(data);
      onSuccess?.(data);
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    },
    onError: (error: ApiError) => {
      if (error.code === 'auth.TOKEN_EXPIRED') {
        setFormError(t('auth.passwordReset.complete.messages.tokenExpired'));
      } else if (error.code === 'auth.TOKEN_INVALID') {
        setFormError(t('auth.passwordReset.complete.messages.tokenInvalid'));
      } else {
        setFormError(error.message || t('errors.generic'));
      }
      onError?.(error);
    },
  });

  // Handle language update from backend response
  useEffect(() => {
    if (resetResponse?.data?.language) {
      const backendLanguage = resetResponse.data.language;
      if (backendLanguage !== i18n.language) {
        changeLanguage(backendLanguage);
      }
    }
  }, [resetResponse, i18n.language, changeLanguage]);

  const onSubmit = async (data: FormData) => {
    setFormError('');
    setSuccessMessage('');
    
    const resetData: PasswordResetCompleteRequest = {
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
      language,
    };

    passwordResetCompleteMutation.mutate(resetData);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            {t('auth.passwordReset.complete.form.password.label')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder={t('auth.passwordReset.complete.form.password.placeholder')}
              style={{ direction: 'ltr' }}
              className={`w-full pr-12 transition-all duration-300 rounded-xl border-2 ${
                errors.password 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:ring-4 focus:ring-opacity-50`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              disabled={isSubmitting}
              aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            {t('auth.passwordReset.complete.form.confirmPassword.label')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder={t('auth.passwordReset.complete.form.confirmPassword.placeholder')}
              style={{ direction: 'ltr' }}
              className={`w-full pr-12 transition-all duration-300 rounded-xl border-2 ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:ring-4 focus:ring-opacity-50`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              disabled={isSubmitting}
              aria-label={showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}

        {/* Form Error */}
        {formError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600 flex items-center gap-2" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formError}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.passwordReset.complete.buttons.submitting')}
            </>
          ) : (
            t('auth.passwordReset.complete.buttons.submit')
          )}
        </Button>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200 hover:underline"
          >
            {t('auth.passwordReset.complete.buttons.backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authService, profileService } from '@/services/api';
import type { ApiError } from '@/types';

interface MandatoryPasswordChangeProps {
  token?: string;
  userId?: string;
}

export default function MandatoryPasswordChangeForm({ token, userId }: MandatoryPasswordChangeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Extended schema for mandatory password change that requires current password
  const createMandatoryPasswordChangeSchema = (t: any) => z.object({
    currentPassword: z.string().min(1, t('validation.required')),
    newPassword: z.string()
      .min(8, t('validation.password.minLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, t('validation.password.complexity')),
    confirmPassword: z.string()
      .min(1, t('validation.required')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('validation.password.mismatch'),
    path: ['confirmPassword'],
  }).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

  const schema = createMandatoryPasswordChangeSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const newPassword = watch('newPassword');

  // Password change mutation - uses changePassword for authenticated users
  const passwordChangeMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      // Use the changePassword endpoint for authenticated users with temporary passwords
      return await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
    },
    onSuccess: (data) => {
      setFormError('');
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    },
    onError: (error: ApiError) => {
      if (error.code === 'auth.INVALID_CURRENT_PASSWORD') {
        setFormError(t('errors.profile.invalidCurrentPassword'));
      } else if (error.code === 'validation.PASSWORD_POLICY_VIOLATION') {
        setFormError(t('validation.password.policyViolation'));
      } else if (error.code === 'auth.PASSWORD_REUSE_VIOLATION') {
        setFormError(t('errors.profile.passwordReuse'));
      } else {
        setFormError(error.message || t('errors.generic'));
      }
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError('');
    passwordChangeMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen gradient-bg-auth relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="glass-card rounded-3xl card-shadow p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.passwordReset.complete.messages.success')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('auth.passwordChange.mandatory.messages.redirecting')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-auth relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background elements */}
      <div className="decorative-blob blob-1"></div>
      <div className="decorative-blob blob-2"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="glass-card rounded-3xl card-shadow hover:card-shadow-hover transition-all duration-300 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 mb-4 floating">
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {t('auth.passwordChange.mandatory.title')}
            </h2>
            <p className="text-gray-600 mt-2">
              {t('auth.passwordChange.mandatory.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                {t('profile.changePassword.form.currentPassword.label')}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('currentPassword')}
                  placeholder={t('profile.changePassword.form.currentPassword.placeholder')}
                  style={{ direction: 'ltr' }}
                  className={`w-full pr-12 transition-all duration-300 rounded-xl border-2 ${
                    errors.currentPassword 
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                  } focus:ring-4 focus:ring-opacity-50`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
                  disabled={isSubmitting}
                  aria-label={showCurrentPassword ? t('common.hidePassword') : t('common.showPassword')}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
                  <span className="text-xs">⚠</span>
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                {t('auth.passwordReset.complete.form.newPassword.label')}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('newPassword')}
                  placeholder={t('auth.passwordReset.complete.form.newPassword.placeholder')}
                  style={{ direction: 'ltr' }}
                  className={`w-full pr-12 transition-all duration-300 rounded-xl border-2 ${
                    errors.newPassword 
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                  } focus:ring-4 focus:ring-opacity-50`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
                  disabled={isSubmitting}
                  aria-label={showNewPassword ? t('common.hidePassword') : t('common.showPassword')}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.newPassword.message}
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
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.passwordChange.mandatory.buttons.submitting')}
                </>
              ) : (
                t('auth.passwordChange.mandatory.buttons.submit')
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

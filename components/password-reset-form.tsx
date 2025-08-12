'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/api';
import type { PasswordResetRequest, ApiError } from '@/types';

// Form validation schema following ? requirements
const createPasswordResetSchema = (t: any) => z.object({
  email: z.string()
    .email(t('validation.email.invalid')),
});

interface PasswordResetFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export default function PasswordResetForm({ onSuccess, onError }: PasswordResetFormProps) {
  const { t } = useTranslation();
  const [formError, setFormError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const schema = createPasswordResetSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // TanStack Query mutation for password reset request
  const passwordResetMutation = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: (data) => {
      setFormError('');
      setSuccessMessage(t('auth.passwordReset.request.messages.success'));
      reset();
      onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      setFormError(error.message || t('errors.generic'));
      onError?.(error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError('');
    setSuccessMessage('');
    
    const resetData: PasswordResetRequest = {
      email: data.email,
    };

    passwordResetMutation.mutate(resetData);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t('auth.passwordReset.request.form.email.label')}
          </Label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            {...register('email')}
            placeholder={t('auth.passwordReset.request.form.email.placeholder')}
            className={`w-full transition-all duration-300 rounded-xl border-2 ${
              errors.email 
                ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:ring-4 focus:ring-opacity-50`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
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
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.passwordReset.request.buttons.submitting')}
            </>
          ) : (
            t('auth.passwordReset.request.buttons.submit')
          )}
        </Button>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 hover:underline"
          >
            {t('auth.passwordReset.request.buttons.backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authService } from '@/services/api';
import { validatePassword } from '@/lib/utils';
import type { RegisterUserRequest, TenantLanguage, TenantLocale, ApiError } from '@/types';

// Form validation schema following ? requirements
const createRegistrationSchema = (t: any) => z.object({
  fullName: z.string()
    .min(2, t('validation.name.minLength'))
    .max(100, t('validation.name.maxLength')),
  email: z.string()
    .email(t('validation.email.invalid')),
  password: z.string()
    .min(8, t('validation.password.minLength'))
    .refine((password) => validatePassword(password).isValid, {
      message: t('validation.password.policyViolation'),
    }),
  confirmPassword: z.string(),
  companyName: z.string()
    .min(2, t('validation.companyName.minLength'))
    .max(200, t('validation.companyName.maxLength')),
  language: z.enum(['persian', 'arabic'] as const),
  locale: z.enum(['iran', 'uae'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.password.confirmationMismatch'),
  path: ['confirmPassword'],
});

interface RegistrationFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export default function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const schema = createRegistrationSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      language: 'persian',
      locale: 'iran',
    },
  });

  const watchedPassword = watch('password');

  // TanStack Query mutation for registration
  const registrationMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setFormError('');
      onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      // Handle field-specific errors
      if (error.errors && error.errors.length > 0) {
        error.errors.forEach((fieldError) => {
          if (fieldError.field === 'email' && fieldError.code === 'auth.EMAIL_ALREADY_EXISTS') {
            setError('email', { message: t('validation.email.alreadyExists') });
          } else {
            setError(fieldError.field as keyof FormData, { message: fieldError.message });
          }
        });
      } else {
        // General error
        setFormError(error.message || t('errors.generic'));
      }
      onError?.(error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError('');
    clearErrors();

    const registrationData: RegisterUserRequest = {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      companyName: data.companyName,
      language: data.language,
      locale: data.locale,
    };

    registrationMutation.mutate(registrationData);
  };

  // Language and locale options
  const languageOptions = [
    { value: 'persian' as TenantLanguage, label: t('auth.registration.form.language.persian') },
    { value: 'arabic' as TenantLanguage, label: t('auth.registration.form.language.arabic') },
  ];

  const localeOptions = [
    { value: 'iran' as TenantLocale, label: t('auth.registration.form.locale.iran') },
    { value: 'uae' as TenantLocale, label: t('auth.registration.form.locale.uae') },
  ];

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, feedback: [] };
    const result = validatePassword(password);
    return {
      strength: result.isValid ? 4 : password.length > 4 ? 2 : 1,
      feedback: result.errors,
    };
  };

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Error Display */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-red-800 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formError}
            </div>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            {t('auth.registration.form.fullName.label')}
          </Label>
          <Input
            id="fullName"
            type="text"
            {...register('fullName')}
            placeholder={t('auth.registration.form.fullName.placeholder')}
            aria-invalid={errors.fullName ? 'true' : 'false'}
            className={`transition-all duration-300 rounded-xl border-2 ${
              errors.fullName 
                ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:ring-4 focus:ring-opacity-50`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            {t('auth.registration.form.email.label')}
          </Label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            {...register('email')}
            placeholder={t('auth.registration.form.email.placeholder')}
            aria-invalid={errors.email ? 'true' : 'false'}
            className={`transition-all duration-300 rounded-xl border-2 ${
              errors.email 
                ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:ring-4 focus:ring-opacity-50`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            {t('auth.registration.form.password.label')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder={t('auth.registration.form.password.placeholder')}
              aria-invalid={errors.password ? 'true' : 'false'}
              style={{ direction: 'ltr' }}
              className={`transition-all duration-300 rounded-xl border-2 pr-12 ${
                errors.password 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:ring-4 focus:ring-opacity-50`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {watchedPassword && (
            <div className="space-y-1">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.strength
                        ? passwordStrength.strength < 3
                          ? 'bg-red-500'
                          : passwordStrength.strength < 4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t('auth.registration.form.confirmPassword.label')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder={t('auth.registration.form.confirmPassword.placeholder')}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              style={{ direction: 'ltr' }}
              className={`transition-all duration-300 rounded-xl border-2 pr-12 ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:ring-4 focus:ring-opacity-50`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">
            {t('auth.registration.form.companyName.label')}
          </Label>
          <Input
            id="companyName"
            type="text"
            {...register('companyName')}
            placeholder={t('auth.registration.form.companyName.placeholder')}
            aria-invalid={errors.companyName ? 'true' : 'false'}
            className={`transition-all duration-300 rounded-xl border-2 ${
              errors.companyName 
                ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
            } focus:ring-4 focus:ring-opacity-50`}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language">
            {t('auth.registration.form.language.label')}
          </Label>
          <Select
            onValueChange={(value) => setValue('language', value as TenantLanguage)}
            defaultValue="persian"
          >
            <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-opacity-50 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200">
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Locale Selection */}
        <div className="space-y-2">
          <Label htmlFor="locale">
            {t('auth.registration.form.locale.label')}
          </Label>
          <Select
            onValueChange={(value) => setValue('locale', value as TenantLocale)}
            defaultValue="iran"
          >
            <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-opacity-50 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200">
              {localeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          disabled={isSubmitting || registrationMutation.isPending}
        >
          {isSubmitting || registrationMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.registration.buttons.submitting')}
            </>
          ) : (
            t('auth.registration.buttons.submit')
          )}
        </Button>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 hover:underline"
          >
            {t('auth.registration.buttons.backToLogin')}
          </Link>
        </div>
      </form>
    </div>
  );
}

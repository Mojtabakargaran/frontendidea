'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/api';
import { useUser } from '@/hooks/use-user';
import { getRoleDashboardUrl } from '@/lib/role-utils';
import type { LoginRequest, ApiError } from '@/types';

// Form validation schema following ? requirements
const createLoginSchema = (t: any) => z.object({
  email: z.string()
    .email(t('validation.email.invalid')),
  password: z.string()
    .min(1, t('validation.required')),
  rememberMe: z.boolean().optional(),
});

interface LoginFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string>('');

  const schema = createLoginSchema(t);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // TanStack Query mutation for login
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setFormError('');
      
      // Handle mandatory password change (? A1)
      if (data.code === 'auth.PASSWORD_RESET_REQUIRED') {
        // Redirect to mandatory password change page
        router.push(`/auth/change-password?token=${data.data.sessionToken}`);
        return;
      }
      
      // Store user data in context according to ? enhanced response
      const userData = {
        userId: data.data.userId,
        tenantId: data.data.tenantId,
        email: data.data.email,
        fullName: data.data.fullName,
        roleName: data.data.roleName,
        permissions: data.data.permissions,
        sessionExpiresAt: data.data.sessionExpiresAt,
      };
      setUser(userData);
      
      onSuccess?.(data);
      
      // Role-based dashboard redirection according to ? A2
      // Always use our role-based URL logic instead of API redirectUrl
      const redirectUrl = getRoleDashboardUrl(data.data.roleName);
      router.push(redirectUrl);
    },
    onError: (error: ApiError) => {
      // Handle specific error cases
      if (error.code === 'auth.INVALID_CREDENTIALS') {
        setFormError(t('auth.login.messages.invalidCredentials'));
      } else if (error.code === 'auth.ACCOUNT_LOCKED') {
        setFormError(t('auth.login.messages.accountLocked'));
      } else if (error.code === 'auth.RATE_LIMIT_EXCEEDED') {
        setFormError(t('auth.login.messages.rateLimitExceeded'));
      } else {
        setFormError(error.message || t('errors.generic'));
      }
      onError?.(error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError('');
    
    const loginData: LoginRequest = {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe || false,
    };

    loginMutation.mutate(loginData);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t('auth.login.form.email.label')}
          </Label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            {...register('email')}
            placeholder={t('auth.login.form.email.placeholder')}
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

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            {t('auth.login.form.password.label')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder={t('auth.login.form.password.placeholder')}
              className={`w-full pr-12 transition-all duration-300 rounded-xl border-2 ${
                errors.password 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              } focus:ring-4 focus:ring-opacity-50`}
              style={{ direction: 'ltr' }}
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Controller
            name="rememberMe"
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                id="rememberMe"
                checked={value}
                onCheckedChange={onChange}
                disabled={isSubmitting}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
          />
          <Label 
            htmlFor="rememberMe" 
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            {t('auth.login.form.rememberMe.label')}
          </Label>
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
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.login.buttons.submitting')}
            </>
          ) : (
            t('auth.login.buttons.submit')
          )}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 hover:underline"
          >
            {t('auth.login.buttons.forgotPassword')}
          </Link>
        </div>

        {/* Back to Registration Link */}
        <div className="text-center">
          <Link
            href="/auth/register"
            className="text-sm text-gray-600 hover:text-gray-500 font-medium transition-colors duration-200 hover:underline"
          >
            {t('auth.login.buttons.backToRegister')}
          </Link>
        </div>
      </form>
    </div>
  );
}

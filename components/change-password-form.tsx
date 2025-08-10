'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Lock, Eye, EyeOff, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { profileService } from '@/services/api';
import type { ChangePasswordRequest, ApiError } from '@/types';

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'رمز عبور فعلی الزامی است'),
  newPassword: z.string()
    .min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'رمز عبور باید شامل حروف کوچک، بزرگ، عدد و علامت خاص باشد'),
  confirmPassword: z.string()
    .min(1, 'تأیید رمز عبور الزامی است')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'رمز عبور جدید و تأیید آن یکسان نیستند',
  path: ['confirmPassword']
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm({ 
  onSuccess, 
  onCancel 
}: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema)
  });

  const changePasswordMutation = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: (data) => {
      setError(null);
      reset();
      
      // Show success message with session information
      const sessionsInvalidated = data.data.sessionsInvalidated;
      if (sessionsInvalidated > 0) {
        // Could show a toast or additional message about sessions
      }
      
      onSuccess();
    },
    onError: (error: ApiError) => {
      setError(error.message);
    }
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    setError(null);
    
    const requestData: ChangePasswordRequest = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    };

    changePasswordMutation.mutate(requestData);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lock className="w-5 h-5 text-green-600" />
          {t('profile.changePassword.title')}
        </CardTitle>
        <p className="text-gray-600">
          {t('profile.changePassword.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('profile.changePassword.form.currentPassword.label')}
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50 pr-10"
                placeholder={t('profile.changePassword.form.currentPassword.placeholder')}
                style={{ direction: 'ltr' }}
                {...register('currentPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('profile.changePassword.form.newPassword.label')}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50 pr-10"
                placeholder={t('profile.changePassword.form.newPassword.placeholder')}
                style={{ direction: 'ltr' }}
                {...register('newPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('profile.changePassword.form.confirmPassword.label')}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50 pr-10"
                placeholder={t('profile.changePassword.form.confirmPassword.placeholder')}
                style={{ direction: 'ltr' }}
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">الزامات رمز عبور:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• حداقل ۸ کاراکتر</li>
              <li>• شامل حروف کوچک و بزرگ انگلیسی</li>
              <li>• شامل حداقل یک عدد</li>
              <li>• شامل حداقل یک علامت خاص (@$!%*?&)</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                  {t('profile.changePassword.buttons.changing')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 me-2" />
                  {t('profile.changePassword.buttons.change')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={changePasswordMutation.isPending}
              className="hover:bg-white/95 px-6 py-3 rounded-xl"
            >
              <X className="w-4 h-4 me-2" />
              {t('profile.changePassword.buttons.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

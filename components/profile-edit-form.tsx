'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Phone, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { profileService } from '@/services/api';
import type { UpdateProfileRequest, ApiError, UserProfileResponse } from '@/types';

interface ProfileEditFormProps {
  profile: UserProfileResponse['data'];
  onSuccess: () => void;
  onCancel: () => void;
}

const updateProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد')
    .max(100, 'نام و نام خانوادگی نمی‌تواند بیش از ۱۰۰ کاراکتر باشد'),
  phoneNumber: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Allow empty
      // Match the backend pattern: ^\\+?[1-9]\\d{1,14}$
      return /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, ''));
    }, {
      message: 'فرمت شماره تلفن صحیح نیست. باید شامل کد کشور و بین ۲ تا ۱۵ رقم باشد (مثال: +989123456789)'
    }),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export default function ProfileEditForm({ 
  profile, 
  onSuccess, 
  onCancel 
}: ProfileEditFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    trigger
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber || ''
    }
  });

  // Watch form values to detect changes
  const watchedValues = watch();
  
  // Calculate if form has changes manually since PhoneInput doesn't trigger isDirty properly
  const hasChanges = useMemo(() => {
    const nameChanged = watchedValues.fullName !== profile.fullName;
    const currentPhone = profile.phoneNumber || '';
    const newPhone = watchedValues.phoneNumber?.trim().replace(/\s/g, '') || '';
    const phoneChanged = newPhone !== currentPhone;
    
    return nameChanged || phoneChanged;
  }, [watchedValues.fullName, watchedValues.phoneNumber, profile.fullName, profile.phoneNumber]);

  const updateMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      // Update the profile query cache
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      setError(null);
      onSuccess();
    },
    onError: (error: ApiError) => {
      setError(error.message);
    }
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    if (!hasChanges) {
      setError(t('profile.edit.messages.noChanges'));
      return;
    }

    setError(null);
    
    const updateData: UpdateProfileRequest = {};
    
    if (data.fullName !== profile.fullName) {
      updateData.fullName = data.fullName;
    }
    
    // Handle phone number properly - only include if it's different and not empty
    const currentPhoneNumber = profile.phoneNumber || '';
    const newPhoneNumber = data.phoneNumber?.trim().replace(/\s/g, '') || '';
    
    if (newPhoneNumber !== currentPhoneNumber) {
      // If the new phone number is empty, send null to clear it
      // If it has a value, send the cleaned value (no spaces)
      updateData.phoneNumber = newPhoneNumber || null;
    }

    updateMutation.mutate(updateData);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="w-5 h-5 text-blue-600" />
          {t('profile.edit.title')}
        </CardTitle>
        <p className="text-gray-600">
          {t('profile.edit.subtitle')}
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

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('profile.edit.form.fullName.label')}
            </Label>
            <Input
              id="fullName"
              type="text"
              className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
              placeholder={t('profile.edit.form.fullName.placeholder')}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t('profile.edit.form.phoneNumber.label')}
            </Label>
            <PhoneInput
              id="phoneNumber"
              className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
              value={watch('phoneNumber') || ''}
              onChange={(value) => {
                setValue('phoneNumber', value);
                trigger('phoneNumber'); // Trigger validation and mark as dirty
              }}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Read-only Information Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{t('profile.edit.restrictedFieldNote.title')}</strong> {t('profile.edit.restrictedFieldNote.message')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !hasChanges}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
                  {t('profile.edit.buttons.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 me-2" />
                  {t('profile.edit.buttons.save')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={updateMutation.isPending}
            >
              <X className="w-4 h-4 me-2" />
              {t('profile.edit.buttons.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

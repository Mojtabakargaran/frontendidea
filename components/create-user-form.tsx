'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  UserPlus, 
  RefreshCw,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

import { userService } from '@/services/api';
import { getRoleDisplayName } from '@/lib/role-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { CreateUserRequest, ApiError, Role } from '@/types';

// Validation schema for ?
const createUserSchema = z.object({
  fullName: z
    .string()
    .min(2, 'users.validation.FULL_NAME_TOO_SHORT')
    .max(100, 'users.validation.FULL_NAME_TOO_LONG'),
  email: z
    .string()
    .email('users.validation.INVALID_EMAIL_FORMAT'),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+[1-9]\d{1,14}$/.test(val),
      'users.validation.INVALID_PHONE_NUMBER_FORMAT'
    ),
  password: z
    .string()
    .optional(),
  roleId: z
    .string()
    .min(1, 'users.validation.ROLE_REQUIRED'),
  status: z
    .enum(['active', 'inactive'])
    .default('active'),
  generatePassword: z
    .boolean()
    .default(false),
}).superRefine((data, ctx) => {
  // If generatePassword is false, validate password requirements
  if (!data.generatePassword) {
    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'users.validation.PASSWORD_REQUIRED',
        path: ['password'],
      });
      return;
    }
    
    if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'users.validation.PASSWORD_TOO_SHORT',
        path: ['password'],
      });
    }
    
    if (!/(?=.*[a-z])/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'users.validation.PASSWORD_MISSING_LOWERCASE',
        path: ['password'],
      });
    }
    
    if (!/(?=.*[A-Z])/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'users.validation.PASSWORD_MISSING_UPPERCASE',
        path: ['password'],
      });
    }
    
    if (!/(?=.*\d)/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'users.validation.PASSWORD_MISSING_NUMBER',
        path: ['password'],
      });
    }
    
    if (!/(?=.*[!@#$%^&*])/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'users.validation.PASSWORD_MISSING_SPECIAL',
        path: ['password'],
      });
    }
  }
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess: (userData: any) => void;
  onCancel: () => void;
}

export default function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      status: 'active',
      generatePassword: false,
    },
  });

  const watchedPassword = watch('password');
  const watchedGeneratePassword = watch('generatePassword');

  // Fetch available roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles
  } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: (data) => {
      onSuccess(data);
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const requestData: CreateUserRequest = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        roleId: data.roleId,
        status: data.status,
        generatePassword: data.generatePassword,
      };

      // Include password if not generating one
      if (!data.generatePassword && data.password) {
        requestData.password = data.password;
      }

      await createUserMutation.mutateAsync(requestData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleGeneratePasswordToggle = (checked: boolean) => {
    setGeneratePassword(checked);
    setValue('generatePassword', checked);
    if (checked) {
      setValue('password', '');
      clearErrors('password'); // Clear password errors when auto-generate is enabled
    }
  };

  const getFieldError = (fieldName: string) => {
    const error = errors[fieldName as keyof typeof errors];
    if (error?.message) {
      return t(error.message);
    }

    // Check for API field errors
    const apiError = createUserMutation.error as unknown as ApiError | undefined;
    if (apiError?.errors) {
      const fieldError = apiError.errors.find(err => err.field === fieldName);
      if (fieldError) {
        return t(fieldError.code);
      }
    }

    return undefined;
  };

  const getApiError = () => {
    const apiError = createUserMutation.error as unknown as ApiError | undefined;
    if (apiError && !apiError.errors?.length) {
      return t(apiError.code);
    }
    return undefined;
  };

  return (
    <Card className="glass-card rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 rounded-2xl flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {t('users.create.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* API Error Display */}
        {getApiError() && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {getApiError()}
            </AlertDescription>
          </Alert>
        )}

        {/* Roles Loading Error */}
        {rolesError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 flex items-center justify-between">
              {t('users.create.roles_load_error')}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRoles()}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('common.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              {t('users.create.form.fullName.label')}
            </Label>
            <Input
              id="fullName"
              type="text"
              {...register('fullName')}
              placeholder={t('users.create.form.fullName.placeholder')}
              className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
              aria-invalid={!!getFieldError('fullName')}
            />
            {getFieldError('fullName') && (
              <p className="text-sm text-red-600">{getFieldError('fullName')}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              {t('users.create.form.email.label')}
            </Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              {...register('email')}
              placeholder={t('users.create.form.email.placeholder')}
              className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
              aria-invalid={!!getFieldError('email')}
            />
            {getFieldError('email') && (
              <p className="text-sm text-red-600">{getFieldError('email')}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
              {t('users.create.form.phoneNumber.label')}
            </Label>
            <PhoneInput
              id="phoneNumber"
              className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
              value={watch('phoneNumber') || ''}
              onChange={(value) => setValue('phoneNumber', value)}
              aria-invalid={!!getFieldError('phoneNumber')}
            />
            {getFieldError('phoneNumber') && (
              <p className="text-sm text-red-600">{getFieldError('phoneNumber')}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="roleId" className="text-gray-700 font-medium">
              {t('users.create.form.role.label')}
            </Label>
            <Select
              onValueChange={(value) => setValue('roleId', value)}
              disabled={rolesLoading || !!rolesError}
            >
              <SelectTrigger className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50">
                <SelectValue placeholder={t('users.create.form.role.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.data.map((role: Role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {getRoleDisplayName(role.name, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('roleId') && (
              <p className="text-sm text-red-600">{getFieldError('roleId')}</p>
            )}
          </div>

          {/* Generate Password Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-xl">
            <Switch
              id="generatePassword"
              checked={generatePassword}
              onCheckedChange={handleGeneratePasswordToggle}
            />
            <Label htmlFor="generatePassword" className="text-gray-700 font-medium cursor-pointer">
              {t('users.create.form.generatePassword.label')}
            </Label>
          </div>

          {/* Manual Password (when not generating) */}
          {!watchedGeneratePassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                {t('users.create.form.password.label')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={t('users.create.form.password.placeholder')}
                  style={{ direction: 'ltr' }}
                  className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50 pr-12"
                  aria-invalid={!!getFieldError('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {getFieldError('password') && (
                <p className="text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>
          )}

          {/* Account Status */}
          <div className="flex items-center space-x-3 p-4 bg-green-50/50 rounded-xl">
            <Switch
              id="status"
              checked={watch('status') === 'active'}
              onCheckedChange={(checked: boolean) => 
                setValue('status', checked ? 'active' : 'inactive')
              }
            />
            <Label htmlFor="status" className="text-gray-700 font-medium cursor-pointer">
              {t('users.create.form.status.label')}
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || rolesLoading || !!rolesError}
              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('users.create.buttons.creating')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('users.create.buttons.create')}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 hover:bg-white/80 py-3 px-6 rounded-xl transition-all duration-300"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  UserIcon, 
  Mail, 
  Phone, 
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
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
import type { User, EditUserRequest, EditUserResponse, ApiError, Role, UserStatus } from '@/types';

// Validation schema for edit user form
const editUserSchema = z.object({
  fullName: z.string()
    .min(2, 'users.edit.form.fullName.errors.min_length')
    .max(100, 'users.edit.form.fullName.errors.max_length')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^\+?[\d\s\-()]+$/.test(val), 'users.edit.form.phoneNumber.errors.invalid_format'),
  roleId: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive'] as const).optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  user: User;
  onCancel: () => void;
  onSuccess: (response: EditUserResponse) => void;
}

export default function EditUserForm({ user, onCancel, onSuccess }: EditUserFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      roleId: user.roleId || '',
      status: user.status as 'active' | 'inactive',
    },
  });

  const [submitError, setSubmitError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Watch form values to track changes
  const formValues = watch();
  const hasChanges = React.useMemo(() => {
    return (
      formValues.fullName !== user.fullName ||
      formValues.phoneNumber !== (user.phoneNumber || '') ||
      formValues.roleId !== user.roleId ||
      formValues.status !== user.status
    );
  }, [formValues, user]);

  // Fetch available roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: (data: EditUserRequest) => userService.editUser(user.id, data),
    onSuccess: (response) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess(response);
    },
    onError: (error: ApiError) => {
      if (error.errors && error.errors.length > 0) {
        // Handle field-specific errors
        const newFieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          newFieldErrors[err.field] = t(err.code || err.message);
        });
        setFieldErrors(newFieldErrors);
        setSubmitError('');
      } else {
        // Handle general errors
        setSubmitError(t(error.code) || error.message);
        setFieldErrors({});
      }
    },
  });

  const onSubmit = async (data: EditUserFormData) => {
    setSubmitError('');
    setFieldErrors({});

    // Only send fields that have changed
    const changedData: EditUserRequest = {};
    
    if (data.fullName && data.fullName !== user.fullName) {
      changedData.fullName = data.fullName;
    }
    
    if (data.phoneNumber !== (user.phoneNumber || '')) {
      changedData.phoneNumber = data.phoneNumber || undefined;
    }
    
    if (data.roleId && data.roleId !== user.roleId) {
      changedData.roleId = data.roleId;
    }
    
    if (data.status && data.status !== user.status) {
      changedData.status = data.status;
    }

    // If no changes, don't submit
    if (Object.keys(changedData).length === 0) {
      setSubmitError(t('users.edit.form.errors.no_changes'));
      return;
    }

    editUserMutation.mutate(changedData);
  };

  const handleCancel = () => {
    reset();
    setSubmitError('');
    setFieldErrors({});
    onCancel();
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'inactive':
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white';
      case 'pending_verification':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white';
      case 'suspended':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('users.edit.back_to_list')}
          </Button>
        </div>
        
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('users.edit.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('users.edit.subtitle')}
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="mb-6 bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>{t('users.edit.current_info')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">{t('users.edit.form.email.label')}</p>
                <p className="font-medium">{user.email}</p>
                <p className="text-xs text-gray-500">{t('users.edit.form.email.readonly_note')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">{t('users.edit.form.currentStatus.label')}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                  {t(`users.status.${user.status}`)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle>{t('users.edit.form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Error */}
            {submitError && (
              <Alert className="border-red-200 bg-red-50/90 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Roles Loading Error */}
            {rolesError && (
              <Alert className="border-red-200 bg-red-50/90 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {t('users.edit.roles_load_error')}
                </AlertDescription>
              </Alert>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                {t('users.edit.form.fullName.label')}
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t('users.edit.form.fullName.placeholder')}
                  className="pl-10 bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
                  {...register('fullName')}
                />
              </div>
              {(errors.fullName || fieldErrors.fullName) && (
                <p className="text-sm text-red-600">
                  {fieldErrors.fullName || t(errors.fullName?.message || '')}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                {t('users.edit.form.phoneNumber.label')}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <PhoneInput
                  id="phoneNumber"
                  className="pl-2 bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
                  value={watch('phoneNumber') || ''}
                  onChange={(value) => setValue('phoneNumber', value)}
                />
              </div>
              {(errors.phoneNumber || fieldErrors.phoneNumber) && (
                <p className="text-sm text-red-600">
                  {fieldErrors.phoneNumber || t(errors.phoneNumber?.message || '')}
                </p>
              )}
            </div>

            {/* Role Assignment */}
            <div className="space-y-2">
              <Label htmlFor="roleId" className="text-sm font-medium text-gray-700">
                {t('users.edit.form.role.label')}
              </Label>
              <Select 
                value={watch('roleId') || ''} 
                onValueChange={(value) => setValue('roleId', value)}
                disabled={rolesLoading}
              >
                <SelectTrigger className="bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50">
                  <SelectValue placeholder={t('users.edit.form.role.placeholder')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-white/30">
                  {rolesData?.data.map((role: Role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {getRoleDisplayName(role.name, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rolesLoading && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  {t('users.edit.form.role.loading')}
                </p>
              )}
              {(errors.roleId || fieldErrors.roleId) && (
                <p className="text-sm text-red-600">
                  {fieldErrors.roleId || t(errors.roleId?.message || '')}
                </p>
              )}
            </div>

            {/* Account Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('users.edit.form.status.label')}
              </Label>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/90 backdrop-blur-sm border border-gray-200/50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {t('users.edit.form.status.active_label')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('users.edit.form.status.active_description')}
                  </p>
                </div>
                <Switch
                  checked={watch('status') === 'active'}
                  onCheckedChange={(checked) => setValue('status', checked ? 'active' : 'inactive')}
                />
              </div>
              {(errors.status || fieldErrors.status) && (
                <p className="text-sm text-red-600">
                  {fieldErrors.status || t(errors.status?.message || '')}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-900 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('users.edit.form.submitting')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('users.edit.form.submit')}
                  </>
                )}
              </Button>
            </div>

            {/* No Changes Warning */}
            {!hasChanges && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t('users.edit.form.no_changes_note')}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

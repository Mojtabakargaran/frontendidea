'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2, Hash, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { inventoryService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import type { InventoryItem, UpdateSerializedItemRequest } from '@/types';
import { ItemType } from '@/types';

// Validation schema for updating serialized item information
const updateSerializedItemSchema = z.object({
  serialNumber: z.string()
    .max(100, 'inventory.serialized.validation.serialNumberMaxLength')
    .optional(),
  confirmSerialNumberChange: z.boolean().default(false),
});

type UpdateSerializedItemFormData = z.infer<typeof updateSerializedItemSchema>;

interface UpdateSerializedFormProps {
  item: InventoryItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateSerializedForm({ 
  item, 
  onSuccess, 
  onCancel 
}: UpdateSerializedFormProps) {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const form = useForm<UpdateSerializedItemFormData>({
    resolver: zodResolver(updateSerializedItemSchema),
    defaultValues: {
      serialNumber: item.serialNumber || '',
      confirmSerialNumberChange: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const watchedSerialNumber = watch('serialNumber');
  const watchedConfirmChange = watch('confirmSerialNumberChange');
  const hasSerialNumberChanged = watchedSerialNumber !== (item.serialNumber || '');
  const hasChanges = hasSerialNumberChanged;

  // Update serialized item mutation
  const updateSerializedMutation = useMutation({
    mutationFn: async (data: UpdateSerializedItemFormData) => {
      const updateData: UpdateSerializedItemRequest = {
        serialNumber: data.serialNumber || undefined,
        confirmSerialNumberChange: data.confirmSerialNumberChange,
      };
      return inventoryService.updateSerializedItem(item.id, updateData);
    },
    onSuccess: () => {
      // Invalidate inventory queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['inventory-item', item.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setShowConfirmation(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Update serialized item failed:', error);
      
      // Handle specific error codes
      if (error.response?.data?.code === 'VALIDATION_ERROR') {
        setErrorMessage(t('inventory.serialized.errors.validationFailed'));
      } else if (error.response?.data?.code === 'SERIAL_NUMBER_EXISTS') {
        setErrorMessage(t('inventory.serialized.errors.serialNumberExists'));
      } else if (error.response?.data?.code === 'ELEVATED_PERMISSIONS_REQUIRED') {
        setErrorMessage(t('inventory.serialized.errors.elevatedPermissionsRequired'));
      } else if (error.response?.data?.code === 'SERIAL_NUMBER_CHANGE_RESTRICTED') {
        setErrorMessage(t('inventory.serialized.errors.serialNumberChangeRestricted'));
      } else if (error.response?.data?.code === 'NOT_FOUND') {
        setErrorMessage(t('inventory.serialized.errors.itemNotFound'));
      } else if (error.response?.data?.code === 'FORBIDDEN') {
        setErrorMessage(t('inventory.serialized.errors.insufficientPermissions'));
      } else {
        setErrorMessage(t('inventory.serialized.errors.updateFailed'));
      }
    },
  });

  React.useEffect(() => {
    // Show confirmation checkbox when serial number changes
    if (hasSerialNumberChanged && !showConfirmation) {
      setShowConfirmation(true);
      setValue('confirmSerialNumberChange', false);
    } else if (!hasSerialNumberChanged && showConfirmation) {
      setShowConfirmation(false);
      setValue('confirmSerialNumberChange', false);
    }
  }, [hasSerialNumberChanged, showConfirmation, setValue]);

  // Only show this form for serialized items
  if (item.itemType !== ItemType.SERIALIZED) {
    return null;
  }

  const onSubmit = (data: UpdateSerializedItemFormData) => {
    setErrorMessage('');
    
    // If serial number changed but not confirmed, show error
    if (hasSerialNumberChanged && !data.confirmSerialNumberChange) {
      setErrorMessage(t('inventory.serialized.errors.confirmationRequired'));
      return;
    }
    
    updateSerializedMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setErrorMessage('');
    setShowConfirmation(false);
    onCancel?.();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Form Header */}
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          <Hash className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('inventory.serialized.title')}
          </h3>
          <p className="dashboard-text-secondary">
            {t('inventory.serialized.subtitle')}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Serialized Item Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Serial Number Field */}
        <div className="space-y-2">
          <Label htmlFor="serialNumber" className="dashboard-text-primary">
            {t('inventory.form.fields.serialNumber.label')}
          </Label>
          <Input
            id="serialNumber"
            {...register('serialNumber')}
            placeholder={t('inventory.serialized.fields.serialNumberPlaceholder')}
            className={`dashboard-input ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={updateSerializedMutation.isPending}
          />
          {errors.serialNumber && (
            <p className="text-sm text-red-600">
              {t(errors.serialNumber.message as string)}
            </p>
          )}
        </div>

        {/* Serial Number Change Confirmation */}
        {showConfirmation && hasSerialNumberChanged && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">
                  {t('inventory.serialized.confirmation.title')}
                </h4>
                <p className="text-sm text-amber-700">
                  {t('inventory.serialized.confirmation.description')}
                </p>
                {item.serialNumber && (
                  <div className="text-sm">
                    <span className="text-amber-700">
                      {t('inventory.serialized.confirmation.currentSerial')}:
                    </span>
                    <span className="font-mono font-medium text-amber-800 ml-2">
                      {item.serialNumber}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-amber-700">
                    {t('inventory.serialized.confirmation.newSerial')}:
                  </span>
                  <span className="font-mono font-medium text-amber-800 ml-2">
                    {watchedSerialNumber || t('inventory.serialized.confirmation.empty')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmSerialNumberChange"
                {...register('confirmSerialNumberChange')}
                checked={watchedConfirmChange}
                onCheckedChange={(checked) => setValue('confirmSerialNumberChange', !!checked)}
              />
              <Label htmlFor="confirmSerialNumberChange" className="text-sm text-amber-800">
                {t('inventory.serialized.confirmation.checkboxLabel')}
              </Label>
            </div>
          </div>
        )}

        {/* Current Information Display */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium dashboard-text-primary">
            {t('inventory.serialized.currentInfo')}
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="dashboard-text-secondary">
                {t('inventory.form.fields.name.label')}:
              </span>
              <span className="dashboard-text-primary font-medium ml-2">
                {item.name}
              </span>
            </div>
            <div>
              <span className="dashboard-text-secondary">
                {t('inventory.form.fields.category.label')}:
              </span>
              <span className="dashboard-text-primary font-medium ml-2">
                {item.categoryName}
              </span>
            </div>
            {item.serialNumber && (
              <div>
                <span className="dashboard-text-secondary">
                  {t('inventory.serialized.fields.currentSerial')}:
                </span>
                <span className="dashboard-text-primary font-mono font-medium ml-2">
                  {item.serialNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <Button
            type="submit"
            disabled={updateSerializedMutation.isPending || !hasChanges}
            className="dashboard-button-primary min-h-[44px]"
          >
            {updateSerializedMutation.isPending ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : null}
            {updateSerializedMutation.isPending 
              ? t('inventory.serialized.actions.updating') 
              : t('inventory.serialized.actions.update')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateSerializedMutation.isPending}
            className="min-h-[44px]"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

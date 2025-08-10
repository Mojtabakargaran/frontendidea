'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { inventoryService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import type { InventoryItem, UpdateNonSerializedItemQuantityRequest } from '@/types';
import { ItemType } from '@/types';

// Validation schema for updating non-serialized item quantity
const updateQuantitySchema = z.object({
  quantity: z.number()
    .min(0, 'inventory.nonSerialized.validation.quantityMin')
    .int('inventory.nonSerialized.validation.quantityInteger'),
  quantityUnit: z.string()
    .max(50, 'inventory.nonSerialized.validation.quantityUnitMaxLength')
    .optional(),
  changeReason: z.string()
    .max(500, 'inventory.nonSerialized.validation.changeReasonMaxLength')
    .optional(),
});

type UpdateQuantityFormData = z.infer<typeof updateQuantitySchema>;

interface UpdateQuantityFormProps {
  item: InventoryItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateQuantityForm({ 
  item, 
  onSuccess, 
  onCancel 
}: UpdateQuantityFormProps) {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [showWarning, setShowWarning] = React.useState(false);

  const form = useForm<UpdateQuantityFormData>({
    resolver: zodResolver(updateQuantitySchema),
    defaultValues: {
      quantity: item.quantity || 0,
      quantityUnit: item.quantityUnit || '',
      changeReason: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, watch } = form;
  const watchedQuantity = watch('quantity');
  const watchedQuantityUnit = watch('quantityUnit');
  const currentQuantity = item.quantity || 0;
  const hasQuantityChanged = watchedQuantity !== currentQuantity;
  const hasUnitChanged = watchedQuantityUnit !== (item.quantityUnit || '');
  const hasChanges = hasQuantityChanged || hasUnitChanged;
  
  // Calculate quantity difference
  const quantityDifference = watchedQuantity - currentQuantity;
  const isSignificantReduction = quantityDifference < 0 && Math.abs(quantityDifference) >= (currentQuantity * 0.5);

  React.useEffect(() => {
    setShowWarning(isSignificantReduction);
  }, [isSignificantReduction]);

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async (data: UpdateQuantityFormData) => {
      const updateData: UpdateNonSerializedItemQuantityRequest = {
        quantity: data.quantity,
        quantityUnit: data.quantityUnit,
        changeReason: data.changeReason,
      };
      return inventoryService.updateNonSerializedItemQuantity(item.id, updateData);
    },
    onSuccess: () => {
      // Invalidate inventory queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['inventory-item', item.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Update quantity failed:', error);
      
      // Handle specific error codes
      if (error.response?.data?.code === 'VALIDATION_ERROR') {
        setErrorMessage(t('inventory.nonSerialized.errors.validationFailed'));
      } else if (error.response?.data?.code === 'QUANTITY_BELOW_ALLOCATED') {
        setErrorMessage(t('inventory.nonSerialized.errors.quantityBelowAllocated'));
      } else if (error.response?.data?.code === 'NOT_FOUND') {
        setErrorMessage(t('inventory.nonSerialized.errors.itemNotFound'));
      } else if (error.response?.data?.code === 'FORBIDDEN') {
        setErrorMessage(t('inventory.nonSerialized.errors.insufficientPermissions'));
      } else {
        setErrorMessage(t('inventory.nonSerialized.errors.updateFailed'));
      }
    },
  });

  // Only show this form for non-serialized items
  if (item.itemType !== ItemType.NON_SERIALIZED) {
    return null;
  }

  const onSubmit = (data: UpdateQuantityFormData) => {
    setErrorMessage('');
    updateQuantityMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setErrorMessage('');
    onCancel?.();
  };

  const getQuantityChangeIcon = () => {
    if (quantityDifference > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (quantityDifference < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Form Header */}
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : ''}`}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('inventory.nonSerialized.title')}
          </h3>
          <p className="dashboard-text-secondary">
            {t('inventory.nonSerialized.subtitle')}
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

      {/* Significant Reduction Warning */}
      {showWarning && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {t('inventory.nonSerialized.warnings.significantReduction')}
          </AlertDescription>
        </Alert>
      )}

      {/* Quantity Update Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Quantity Field */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="dashboard-text-primary">
            {t('inventory.form.fields.quantity.label')}
          </Label>
          <Input
            id="quantity"
            type="number"
            {...register('quantity', { valueAsNumber: true })}
            className={`dashboard-input ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={updateQuantityMutation.isPending}
            min="0"
            step="1"
          />
          {errors.quantity && (
            <p className="text-sm text-red-600">
              {t(errors.quantity.message as string)}
            </p>
          )}
        </div>

        {/* Quantity Unit Field */}
        <div className="space-y-2">
          <Label htmlFor="quantityUnit" className="dashboard-text-primary">
            {t('inventory.form.fields.quantityUnit.label')}
          </Label>
          <Input
            id="quantityUnit"
            {...register('quantityUnit')}
            placeholder={t('inventory.form.fields.quantityUnit.placeholder')}
            className={`dashboard-input ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={updateQuantityMutation.isPending}
          />
          {errors.quantityUnit && (
            <p className="text-sm text-red-600">
              {t(errors.quantityUnit.message as string)}
            </p>
          )}
        </div>

        {/* Change Reason Field */}
        {(hasChanges || isSignificantReduction) && (
          <div className="space-y-2">
            <Label htmlFor="changeReason" className="dashboard-text-primary">
              {t('inventory.nonSerialized.fields.changeReason')}
              {isSignificantReduction && (
                <span className="text-amber-600 ml-1">
                  ({t('inventory.nonSerialized.fields.changeReasonRequired')})
                </span>
              )}
            </Label>
            <Textarea
              id="changeReason"
              {...register('changeReason')}
              placeholder={t('inventory.nonSerialized.fields.changeReasonPlaceholder')}
              className={`dashboard-input ${isRTL ? 'text-right' : 'text-left'}`}
              disabled={updateQuantityMutation.isPending}
              rows={3}
            />
            {errors.changeReason && (
              <p className="text-sm text-red-600">
                {t(errors.changeReason.message as string)}
              </p>
            )}
          </div>
        )}

        {/* Quantity Change Summary */}
        {hasQuantityChanged && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-3">
              {t('inventory.nonSerialized.changeSummary.title')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">
                  {t('inventory.nonSerialized.changeSummary.currentQuantity')}:
                </span>
                <span className="font-medium text-blue-800">
                  {currentQuantity} {item.quantityUnit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">
                  {t('inventory.nonSerialized.changeSummary.newQuantity')}:
                </span>
                <span className="font-medium text-blue-800">
                  {watchedQuantity} {watchedQuantityUnit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">
                  {t('inventory.nonSerialized.changeSummary.difference')}:
                </span>
                <div className="flex items-center gap-2">
                  {getQuantityChangeIcon()}
                  <span className={`font-medium ${quantityDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {quantityDifference >= 0 ? '+' : ''}{quantityDifference}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Information Display */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium dashboard-text-primary">
            {t('inventory.nonSerialized.currentInfo')}
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="dashboard-text-secondary">
                {t('inventory.form.fields.name.label')}:
              </span>
              <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {item.name}
              </span>
            </div>
            <div>
              <span className="dashboard-text-secondary">
                {t('inventory.form.fields.category.label')}:
              </span>
              <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {item.categoryName}
              </span>
            </div>
            <div>
              <span className="dashboard-text-secondary">
                {t('inventory.nonSerialized.fields.currentQuantity')}:
              </span>
              <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {currentQuantity} {item.quantityUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            type="submit"
            disabled={updateQuantityMutation.isPending || !hasChanges}
            className="dashboard-button-primary min-h-[44px]"
          >
            {updateQuantityMutation.isPending ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : null}
            {updateQuantityMutation.isPending 
              ? t('inventory.nonSerialized.actions.updating') 
              : t('inventory.nonSerialized.actions.update')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateQuantityMutation.isPending}
            className="min-h-[44px]"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

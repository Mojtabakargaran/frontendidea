'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { inventoryService, categoriesService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import type { InventoryItem, UpdateInventoryItemRequest, InventoryItemStatus } from '@/types';

// Validation schema for editing inventory item basic information
const editInventoryItemSchema = z.object({
  name: z.string()
    .min(1, 'inventory.form.validation.nameRequired')
    .max(255, 'inventory.form.validation.nameMaxLength'),
  description: z.string()
    .max(2000, 'inventory.form.validation.descriptionMaxLength')
    .optional(),
  categoryId: z.string()
    .min(1, 'inventory.form.validation.categoryRequired'),
  status: z.enum(['active', 'inactive', 'archived'], {
    required_error: 'inventory.form.validation.statusRequired'
  }),
});

type EditInventoryItemFormData = z.infer<typeof editInventoryItemSchema>;

interface EditInventoryItemFormProps {
  item: InventoryItem;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditInventoryItemForm({ 
  item, 
  onSuccess, 
  onCancel 
}: EditInventoryItemFormProps) {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = React.useState<string>('');

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', { page: 1, limit: 50 }],
    queryFn: () => categoriesService.getCategories({ page: 1, limit: 50 }),
    retry: 1,
  });

  const form = useForm<EditInventoryItemFormData>({
    resolver: zodResolver(editInventoryItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId,
      status: item.status,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const watchedName = watch('name');
  const watchedDescription = watch('description');
  const watchedCategoryId = watch('categoryId');
  const watchedStatus = watch('status');
  
  // Check if any changes have been made
  const hasChanges = 
    watchedName !== item.name ||
    (watchedDescription || '') !== (item.description || '') ||
    watchedCategoryId !== item.categoryId ||
    watchedStatus !== item.status;

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (data: EditInventoryItemFormData) => {
      const updateData: UpdateInventoryItemRequest = {
        name: data.name,
        description: data.description || undefined,
        categoryId: data.categoryId,
        status: data.status as InventoryItemStatus,
        version: item.version,
      };
      return inventoryService.updateInventoryItem(item.id, updateData);
    },
    onSuccess: () => {
      // Invalidate inventory queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['inventory-item', item.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Update item failed:', error);
      
      // Handle specific error codes
      if (error.response?.data?.code === 'VALIDATION_ERROR') {
        if (error.response.data.errors?.name) {
          setErrorMessage(error.response.data.errors.name);
        } else {
          setErrorMessage(t('inventory.edit.errors.validationFailed'));
        }
      } else if (error.response?.data?.code === 'EDIT_CONFLICT') {
        setErrorMessage(t('inventory.edit.errors.editConflict'));
      } else if (error.response?.data?.code === 'NOT_FOUND') {
        setErrorMessage(t('inventory.edit.errors.itemNotFound'));
      } else if (error.response?.data?.code === 'FORBIDDEN') {
        setErrorMessage(t('inventory.edit.errors.insufficientPermissions'));
      } else {
        setErrorMessage(t('inventory.edit.errors.updateFailed'));
      }
    },
  });

  const onSubmit = (data: EditInventoryItemFormData) => {
    setErrorMessage('');
    updateItemMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setErrorMessage('');
    onCancel?.();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Form Header */}
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('inventory.edit.title')}
          </h2>
          <p className="dashboard-text-secondary">
            {t('inventory.edit.subtitle')}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Item Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="dashboard-text-primary">
            {t('inventory.form.fields.name.label')}
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder={t('inventory.form.fields.name.placeholder')}
            className={`dashboard-input ${isRTL ? 'text-right' : 'text-left'}`}
            disabled={updateItemMutation.isPending}
          />
          {errors.name && (
            <p className="text-sm text-red-600">
              {t(errors.name.message as string)}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="dashboard-text-primary">
            {t('inventory.form.fields.description.label')}
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('inventory.form.fields.description.placeholder')}
            className={`dashboard-input resize-none ${isRTL ? 'text-right' : 'text-left'}`}
            rows={3}
            disabled={updateItemMutation.isPending}
          />
          {errors.description && (
            <p className="text-sm text-red-600">
              {t(errors.description.message as string)}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="dashboard-text-primary">
            {t('inventory.form.fields.category.label')}
          </Label>
          <Select
            value={watchedCategoryId}
            onValueChange={(value) => setValue('categoryId', value)}
            disabled={updateItemMutation.isPending}
          >
            <SelectTrigger className="dashboard-input">
              <SelectValue placeholder={t('inventory.form.fields.category.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  {t('common.loading')}
                </SelectItem>
              ) : (
                categoriesData?.data.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-600">
              {t(errors.categoryId.message as string)}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="dashboard-text-primary">
            {t('inventory.details.fields.itemStatus')}
          </Label>
          <Select
            value={watchedStatus}
            onValueChange={(value) => setValue('status', value as InventoryItemStatus)}
            disabled={updateItemMutation.isPending}
          >
            <SelectTrigger className="dashboard-input">
              <SelectValue placeholder={t('inventory.form.fields.status.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('inventory.details.status.active')}</SelectItem>
              <SelectItem value="inactive">{t('inventory.details.status.inactive')}</SelectItem>
              <SelectItem value="archived">{t('inventory.details.status.archived')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">
              {t(errors.status.message as string)}
            </p>
          )}
        </div>

        {/* Current Item Information Display */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-medium dashboard-text-primary">
            {t('inventory.edit.readOnlyInfo')}
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="dashboard-text-secondary">
          {t('inventory.form.fields.itemType.label')}:
              </span>
              <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
          {t(`inventory.itemType.${item.itemType}`)}
              </span>
              {item.hasRentalHistory && (
          <p className="text-xs text-amber-600 mt-1">
            {t('inventory.edit.itemTypeLockedDueToHistory')}
          </p>
              )}
            </div>
            {item.serialNumber && (
              <div>
          <span className="dashboard-text-secondary">
            {t('inventory.form.fields.serialNumber.label')}:
          </span>
          <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
            {item.serialNumber}
          </span>
              </div>
            )}
            {item.quantity !== undefined && (
              <div>
          <span className="dashboard-text-secondary">
            {t('inventory.form.fields.quantity.label')}:
          </span>
          <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
            {item.quantity} {item.quantityUnit}
          </span>
              </div>
            )}
            <div>
              <span className="dashboard-text-secondary">
          {t('inventory.edit.fields.availabilityStatus.label')}:
              </span>
              <span className={`dashboard-text-primary font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
          {t(`inventory.status.${item.availabilityStatus}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <Button
            type="submit"
            disabled={updateItemMutation.isPending || !hasChanges}
            className="dashboard-button-primary min-h-[44px]"
          >
            {updateItemMutation.isPending ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : null}
            {updateItemMutation.isPending 
              ? t('inventory.edit.actions.updating') 
              : t('inventory.edit.actions.update')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateItemMutation.isPending}
            className="min-h-[44px]"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

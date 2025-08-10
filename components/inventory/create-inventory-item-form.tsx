'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Plus, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { inventoryService, categoriesService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import type { 
  CreateInventoryItemRequest, 
  ItemType, 
  Category,
  ApiError 
} from '@/types';

// Form validation schema
const createInventoryItemSchema = z.object({
  name: z.string()
    .min(1, 'inventory.form.validation.nameRequired')
    .max(255, 'inventory.form.validation.nameMaxLength'),
  description: z.string()
    .max(2000, 'inventory.form.validation.descriptionMaxLength')
    .optional(),
  categoryId: z.string()
    .min(1, 'inventory.form.validation.categoryRequired'),
  itemType: z.enum(['serialized', 'non_serialized'], {
    required_error: 'inventory.form.validation.itemTypeRequired'
  }),
  serialNumber: z.string()
    .max(100, 'inventory.form.validation.serialNumberMaxLength')
    .optional(),
  autoGenerateSerial: z.boolean().optional(),
  quantity: z.number()
    .min(0, 'inventory.form.validation.quantityMin')
    .optional(),
  quantityUnit: z.string()
    .max(50, 'inventory.form.validation.quantityUnitMaxLength')
    .optional(),
}).refine((data) => {
  // For serialized items, either provide a serial number or enable auto-generation
  if (data.itemType === 'serialized') {
    return data.serialNumber || data.autoGenerateSerial;
  }
  return true;
}, {
  message: 'inventory.form.validation.serialNumberOrAutoGenerate',
  path: ['serialNumber']
}).refine((data) => {
  // For non-serialized items, quantity is required
  if (data.itemType === 'non_serialized') {
    return data.quantity !== undefined && data.quantity >= 0;
  }
  return true;
}, {
  message: 'inventory.form.validation.quantityRequired',
  path: ['quantity']
});

type FormData = z.infer<typeof createInventoryItemSchema>;

export default function CreateInventoryItemForm() {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const queryClient = useQueryClient();
  
  const [isGeneratingSerial, setIsGeneratingSerial] = useState(false);
  const [generatedSerial, setGeneratedSerial] = useState('');

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      itemType: 'serialized',
      serialNumber: '',
      autoGenerateSerial: true,
      quantity: 0,
      quantityUnit: '',
    },
  });

  const itemType = watch('itemType');
  const autoGenerateSerial = watch('autoGenerateSerial');

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', { page: 1, limit: 50 }], // Use same pattern as categories list
    queryFn: () => categoriesService.getCategories({ page: 1, limit: 50 }),
    retry: 1,
  });

  // Generate serial number mutation
  const generateSerialMutation = useMutation({
    mutationFn: inventoryService.generateSerialNumber,
    onSuccess: (response) => {
      const serialNumber = response.data.serialNumber;
      setGeneratedSerial(serialNumber);
      setValue('serialNumber', serialNumber);
      setValue('autoGenerateSerial', true);
    },
    onError: (error: ApiError) => {
      console.error('Serial generation failed:', error);
    },
    onSettled: () => {
      setIsGeneratingSerial(false);
    }
  });

  // Create inventory item mutation
  const createItemMutation = useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryService.createInventoryItem(data),
    onSuccess: () => {
      // Invalidate and refetch inventory items list
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      
      // Reset form
      reset();
      setGeneratedSerial('');
    },
    onError: (error: ApiError) => {
      console.error('Item creation failed:', error);
    }
  });

  // Handle item type change
  const handleItemTypeChange = useCallback((value: string) => {
    const newItemType = value as ItemType;
    setValue('itemType', newItemType);
    
    if (newItemType === 'serialized') {
      // Reset non-serialized fields
      setValue('quantity', undefined);
      setValue('quantityUnit', '');
      // Set default for serialized
      setValue('autoGenerateSerial', true);
    } else {
      // Reset serialized fields
      setValue('serialNumber', '');
      setValue('autoGenerateSerial', false);
      setGeneratedSerial('');
      // Set default for non-serialized
      setValue('quantity', 0);
      setValue('quantityUnit', '');
    }
  }, [setValue]);

  // Handle serial number generation
  const handleGenerateSerial = useCallback(async () => {
    if (isGeneratingSerial) return;
    
    setIsGeneratingSerial(true);
    generateSerialMutation.mutate();
  }, [generateSerialMutation, isGeneratingSerial]);

  // Handle auto-generate serial toggle
  const handleAutoGenerateChange = useCallback((checked: boolean) => {
    setValue('autoGenerateSerial', checked);
    
    if (!checked) {
      // Clear generated serial when auto-generate is disabled
      setGeneratedSerial('');
      setValue('serialNumber', '');
    } else if (!generatedSerial) {
      // Generate a new serial when auto-generate is enabled and no serial exists
      handleGenerateSerial();
    }
  }, [setValue, generatedSerial, handleGenerateSerial]);

  // Form submission
  const onSubmit = useCallback((data: FormData) => {
    const payload: CreateInventoryItemRequest = {
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      categoryId: data.categoryId,
      itemType: data.itemType as ItemType,
    };

    if (data.itemType === 'serialized') {
      if (data.autoGenerateSerial) {
        payload.autoGenerateSerial = true;
      } else if (data.serialNumber) {
        payload.serialNumber = data.serialNumber.trim();
      }
    } else {
      payload.quantity = data.quantity;
      if (data.quantityUnit?.trim()) {
        payload.quantityUnit = data.quantityUnit.trim();
      }
    }

    createItemMutation.mutate(payload);
  }, [createItemMutation]);

  return (
    <div className="dashboard-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold dashboard-text-primary">
            {t('inventory.form.title')}
          </h2>
          <p className="dashboard-text-muted">
            {t('inventory.form.subtitle')}
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {createItemMutation.isSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {t('inventory.form.messages.createSuccess')}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {createItemMutation.isError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {createItemMutation.error?.message || t('inventory.form.messages.createError')}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Item Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="dashboard-text-primary font-medium">
            {t('inventory.form.fields.name.label')} *
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder={t('inventory.form.fields.name.placeholder')}
            className="dashboard-input"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {errors.name && (
            <p className="text-red-600 text-sm">{t(errors.name.message!)}</p>
          )}
        </div>

        {/* Item Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="dashboard-text-primary font-medium">
            {t('inventory.form.fields.description.label')}
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('inventory.form.fields.description.placeholder')}
            className="dashboard-input resize-none"
            rows={3}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {errors.description && (
            <p className="text-red-600 text-sm">{t(errors.description.message!)}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="dashboard-text-primary font-medium">
            {t('inventory.form.fields.category.label')} *
          </Label>
          <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value)}>
            <SelectTrigger className="dashboard-input">
              <SelectValue placeholder={t('inventory.form.fields.category.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  {t('common.loading')}
                </SelectItem>
              ) : (
                categoriesData?.data.categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-red-600 text-sm">{t(errors.categoryId.message!)}</p>
          )}
        </div>

        {/* Item Type */}
        <div className="space-y-2">
          <Label className="dashboard-text-primary font-medium">
            {t('inventory.form.fields.itemType.label')} *
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleItemTypeChange('serialized')}
              className={`p-3 border rounded-lg text-left transition-colors ${
                itemType === 'serialized'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{t('inventory.itemType.serialized')}</div>
              <div className="text-sm text-gray-600">{t('inventory.itemType.serializedDesc')}</div>
            </button>
            <button
              type="button"
              onClick={() => handleItemTypeChange('non_serialized')}
              className={`p-3 border rounded-lg text-left transition-colors ${
                itemType === 'non_serialized'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{t('inventory.itemType.non_serialized')}</div>
              <div className="text-sm text-gray-600">{t('inventory.itemType.nonSerializedDesc')}</div>
            </button>
          </div>
          {errors.itemType && (
            <p className="text-red-600 text-sm">{t(errors.itemType.message!)}</p>
          )}
        </div>

        {/* Serialized Item Fields */}
        {itemType === 'serialized' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium dashboard-text-primary">
              {t('inventory.form.serialized.title')}
            </h3>

            {/* Auto-generate Serial */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="autoGenerateSerial"
                checked={autoGenerateSerial}
                onChange={(e) => handleAutoGenerateChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="autoGenerateSerial" className="cursor-pointer dashboard-text-secondary">
                {t('inventory.form.fields.autoGenerateSerial.label')}
              </Label>
            </div>

            {/* Manual Serial Number */}
            {!autoGenerateSerial && (
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="dashboard-text-primary font-medium">
                  {t('inventory.form.fields.serialNumber.label')}
                </Label>
                <Input
                  id="serialNumber"
                  {...register('serialNumber')}
                  placeholder={t('inventory.form.fields.serialNumber.placeholder')}
                  className="dashboard-input font-mono"
                  dir="ltr"
                />
                {errors.serialNumber && (
                  <p className="text-red-600 text-sm">{t(errors.serialNumber.message!)}</p>
                )}
              </div>
            )}

            {/* Generated Serial Display */}
            {autoGenerateSerial && generatedSerial && (
              <div className="space-y-2">
                <Label className="dashboard-text-primary font-medium">
                  {t('inventory.form.fields.generatedSerial.label')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedSerial}
                    readOnly
                    className="dashboard-input font-mono bg-gray-50"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSerial}
                    disabled={isGeneratingSerial}
                    className="shrink-0"
                  >
                    {isGeneratingSerial ? (
                      <LoadingSpinner className="w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Generate Serial Button */}
            {autoGenerateSerial && !generatedSerial && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateSerial}
                disabled={isGeneratingSerial}
                className="w-full"
              >
                {isGeneratingSerial ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    {t('inventory.form.actions.generating')}
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    {t('inventory.form.actions.generateSerial')}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Non-Serialized Item Fields */}
        {itemType === 'non_serialized' && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium dashboard-text-primary">
              {t('inventory.form.nonSerialized.title')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="dashboard-text-primary font-medium">
                  {t('inventory.form.fields.quantity.label')} *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="0"
                  className="dashboard-input"
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm">{t(errors.quantity.message!)}</p>
                )}
              </div>

              {/* Quantity Unit */}
              <div className="space-y-2">
                <Label htmlFor="quantityUnit" className="dashboard-text-primary font-medium">
                  {t('inventory.form.fields.quantityUnit.label')}
                </Label>
                <Input
                  id="quantityUnit"
                  {...register('quantityUnit')}
                  placeholder={t('inventory.form.fields.quantityUnit.placeholder')}
                  className="dashboard-input"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.quantityUnit && (
                  <p className="text-red-600 text-sm">{t(errors.quantityUnit.message!)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createItemMutation.isPending}
          className="w-full dashboard-button-primary rounded-xl py-3 min-h-[44px]"
        >
          {createItemMutation.isPending ? (
            <>
              <LoadingSpinner className="w-5 h-5 mr-2" />
              {t('inventory.form.actions.creating')}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              {t('inventory.form.actions.create')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

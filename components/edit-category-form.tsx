'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, X, Save } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { categoriesService } from '@/services/api';
import type { Category, UpdateCategoryRequest, ApiError } from '@/types';

interface EditCategoryFormProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedCategory: Category) => void;
}

// Form validation schema based on ? requirements
const editCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'categories.validation.name.required')
    .max(255, 'categories.validation.name.maxLength'),
  description: z
    .string()
    .max(500, 'categories.validation.description.maxLength')
    .optional()
    .or(z.literal('')),
});

type EditCategoryForm = z.infer<typeof editCategorySchema>;

export default function EditCategoryForm({ 
  category, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditCategoryFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EditCategoryForm>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || '',
    }
  });

  // Watch form values to detect changes
  const nameValue = watch('name');
  const descriptionValue = watch('description');
  
  // Check if form has changes
  const hasChanges = nameValue !== category.name || 
                    (descriptionValue || '') !== (category.description || '');

  // Reset form when category changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: category.name,
        description: category.description || '',
      });
      setFieldErrors({});
    }
  }, [category, isOpen, reset]);

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (data: UpdateCategoryRequest) => 
      categoriesService.updateCategory(category.id, data),
    onSuccess: (response) => {
      // Invalidate categories query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Call success callback with updated category data
      if (onSuccess) {
        onSuccess({
          ...category,
          ...response.data,
        });
      }
      
      // Close the form
      onClose();
    },
    onError: (error: ApiError) => {
      // Handle field-specific errors
      if (error.errors) {
        const newFieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          newFieldErrors[err.field] = t(err.message);
        });
        setFieldErrors(newFieldErrors);
      }
    }
  });

  const onSubmit = (data: EditCategoryForm) => {
    // Clear previous errors
    setFieldErrors({});
    
    // Submit the form
    updateCategoryMutation.mutate({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    });
  };

  const handleCancel = () => {
    reset();
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="dashboard-text-primary flex items-center gap-3">
                <Package className="h-6 w-6" />
                {t('categories.edit.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* General Error */}
            {updateCategoryMutation.error && !Object.keys(fieldErrors).length && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {updateCategoryMutation.error.message || t('categories.messages.updateError')}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="dashboard-text-primary font-medium">
                  {t('categories.form.name.label')} *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('categories.form.name.placeholder')}
                  {...register('name')}
                  className={`dashboard-input rounded-xl ${
                    errors.name || fieldErrors.name ? 'border-red-300' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {(errors.name || fieldErrors.name) && (
                  <p className="text-red-600 text-sm">
                    {fieldErrors.name || t(errors.name?.message || '')}
                  </p>
                )}
                <p className="text-xs dashboard-text-muted">
                  {nameValue?.length || 0}/255
                </p>
              </div>

              {/* Category Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="dashboard-text-primary font-medium">
                  {t('categories.form.description.label')}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t('categories.form.description.placeholder')}
                  {...register('description')}
                  className={`dashboard-input rounded-xl min-h-[100px] resize-none ${
                    errors.description || fieldErrors.description ? 'border-red-300' : ''
                  }`}
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  {(errors.description || fieldErrors.description) && (
                    <p className="text-red-600 text-sm">
                      {fieldErrors.description || t(errors.description?.message || '')}
                    </p>
                  )}
                  <p className="text-xs dashboard-text-muted ml-auto">
                    {descriptionValue?.length || 0}/500
                  </p>
                </div>
              </div>

              {/* Warning about associated items */}
              {typeof category.itemsCount === 'number' && category.itemsCount > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-800">
                    {t('categories.edit.warningAssociatedItems', { count: category.itemsCount })}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                  className="dashboard-button-primary rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('categories.edit.buttons.updating')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('categories.edit.buttons.update')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { categoriesService } from '@/services/api';
import type { CreateCategoryRequest, ApiError } from '@/types';

// Validation schema following ? business rules
const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'categories.form.name.validation.required')
    .min(2, 'categories.form.name.validation.minLength')
    .max(255, 'categories.form.name.validation.maxLength')
    .trim(),
  description: z.string()
    .max(500, 'categories.form.description.validation.maxLength')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export default function CreateCategoryForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesService.createCategory(data),
    onSuccess: () => {
      // Invalidate all category-related queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      reset();
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const onSubmit = (data: CreateCategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  const getErrorMessage = (error: unknown) => {
    const apiError = error as ApiError;
    if (apiError.code === 'CATEGORY_NAME_EXISTS') {
      return t('categories.messages.duplicateName');
    }
    return apiError.message || 'An error occurred';
  };

  // Watch form values for character counting
  const nameValue = watch('name');
  const descriptionValue = watch('description');

  return (
    <Card className="dashboard-card rounded-2xl">
      <CardHeader>
        <CardTitle className="dashboard-text-primary flex items-center gap-3">
          <Plus className="h-6 w-6" />
          {t('categories.form.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('categories.messages.createSuccess')}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {createCategoryMutation.error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {getErrorMessage(createCategoryMutation.error)}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="dashboard-text-primary font-semibold">
              {t('categories.form.name.label')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('categories.form.name.placeholder')}
              className={`dashboard-input rounded-xl ${errors.name ? 'border-red-300' : ''}`}
              disabled={createCategoryMutation.isPending}
            />
            <div className="flex items-center justify-between">
              {errors.name && (
                <p className="text-red-600 text-sm">
                  {t(errors.name.message as string)}
                </p>
              )}
              <p className="text-xs dashboard-text-muted ml-auto">
                {nameValue?.length || 0}/255
              </p>
            </div>
          </div>

          {/* Category Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="dashboard-text-primary font-semibold">
              {t('categories.form.description.label')}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('categories.form.description.placeholder')}
              className={`dashboard-input rounded-xl min-h-[100px] resize-none ${
                errors.description ? 'border-red-300' : ''
              }`}
              disabled={createCategoryMutation.isPending}
            />
            <div className="flex items-center justify-between">
              {errors.description && (
                <p className="text-red-600 text-sm">
                  {t(errors.description.message as string)}
                </p>
              )}
              <p className="text-xs dashboard-text-muted ml-auto">
                {descriptionValue?.length || 0}/500
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="dashboard-button-primary rounded-xl w-full"
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                {t('categories.form.buttons.submitting')}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-3" />
                {t('categories.form.buttons.submit')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

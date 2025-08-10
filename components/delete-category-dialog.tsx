'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Category } from '@/types';

interface DeleteCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: string) => void;
  isDeleting?: boolean;
  hasAssociatedItems?: boolean;
  associatedItemsCount?: number;
}

export default function DeleteCategoryDialog({
  category,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  hasAssociatedItems = false,
  associatedItemsCount = 0,
}: DeleteCategoryDialogProps) {
  const { t } = useTranslation();

  if (!category) return null;

  const handleConfirm = () => {
    if (!hasAssociatedItems && category.id) {
      onConfirm(category.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dashboard-card rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="dashboard-text-primary flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            {t('categories.delete.title')}
          </DialogTitle>
          <DialogDescription className="dashboard-text-secondary">
            {t('categories.delete.description', { categoryName: category.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Warning about permanent deletion */}
          <Alert className="border-orange-200 bg-orange-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {t('categories.delete.warning')}
            </AlertDescription>
          </Alert>

          {/* Error if category has associated items */}
          {hasAssociatedItems && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {t('categories.delete.hasItemsError', { 
                  count: associatedItemsCount 
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Category details for confirmation */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <div className="font-medium dashboard-text-primary">
                {t('categories.delete.categoryToDelete')}
              </div>
              <div className="mt-1 dashboard-text-secondary">
                <span className="font-semibold">{category.name}</span>
                {category.description && (
                  <div className="text-xs mt-1 text-gray-500">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            className="dashboard-button-secondary rounded-xl"
            disabled={isDeleting}
            onClick={onClose}
          >
            {t('categories.form.buttons.cancel')}
          </Button>
          
          {!hasAssociatedItems && (
            <Button
              variant="destructive"
              className="dashboard-button-primary bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl min-h-[44px]"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('categories.delete.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('categories.delete.confirm')}
                </>
              )}
            </Button>
          )}

          {hasAssociatedItems && (
            <Button
              variant="outline"
              className="dashboard-button-secondary rounded-xl"
              onClick={onClose}
            >
              {t('categories.delete.understood')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

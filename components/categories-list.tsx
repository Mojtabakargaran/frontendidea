'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Folder, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Hash,
  Trash2,
  Edit
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDirection } from '@/hooks/use-direction';
import { useClientPermissions } from '@/hooks/use-permissions';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate as formatDateUtil, formatNumber as formatNumberUtil } from '@/lib/locale-formatting';
import { categoriesService } from '@/services/api';
import DeleteCategoryDialog from '@/components/delete-category-dialog';
import EditCategoryForm from '@/components/edit-category-form';
import type { Category, CategoriesListParams, CategoriesListResponse, TenantLocale, TenantLanguage } from '@/types';

interface CategoriesListProps {
  showSearch?: boolean;
  pageSize?: number;
}

export default function CategoriesList({ 
  showSearch = true, 
  pageSize = 20 
}: CategoriesListProps) {
  const { t, i18n } = useTranslation();
  const direction = useDirection();
  const { config } = useGlobalLocaleFormatting();
  const { canUpdate } = useClientPermissions();
  const isRTL = direction === 'rtl';
  
  // Memoize the formatting functions
  const formatDate = React.useCallback((dateString: string) => {
    const languageSpecificConfig = {
      ...config,
      locale: (i18n.language === 'fa' ? 'iran' : 'uae') as TenantLocale,
      language: (i18n.language === 'fa' ? 'persian' : 'arabic') as TenantLanguage,
      dateFormat: {
        ...config.dateFormat,
        calendar: (i18n.language === 'fa' ? 'persian' : 'gregorian') as 'persian' | 'gregorian'
      },
      numberFormat: {
        ...config.numberFormat,
        digits: (i18n.language === 'fa' ? 'persian' : 'arabic') as 'persian' | 'arabic' | 'latin'
      }
    };
    return formatDateUtil(dateString, languageSpecificConfig);
  }, [config, i18n.language]);

  const formatNumber = React.useCallback((number: number) => {
    const languageSpecificConfig = {
      ...config,
      locale: (i18n.language === 'fa' ? 'iran' : 'uae') as TenantLocale,
      language: (i18n.language === 'fa' ? 'persian' : 'arabic') as TenantLanguage,
      numberFormat: {
        ...config.numberFormat,
        digits: (i18n.language === 'fa' ? 'persian' : 'arabic') as 'persian' | 'arabic' | 'latin'
      }
    };
    return formatNumberUtil(number, languageSpecificConfig);
  }, [config, i18n.language]);

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // State for delete functionality
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [itemsCountCheck, setItemsCountCheck] = useState<{ itemsCount: number; canDelete: boolean } | null>(null);

  // State for edit functionality
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query parameters
  const queryParams: CategoriesListParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    ...(debouncedSearch.length >= 2 && { search: debouncedSearch }),
  }), [currentPage, pageSize, debouncedSearch]);

  // Categories query
  const {
    data: categoriesResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', queryParams],
    queryFn: () => categoriesService.getCategories(queryParams),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesService.deleteCategory,
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      setDeletionError(null);
      setItemsCountCheck(null);
    },
    onError: (error: any) => {
      setDeletionError(error.message || t('categories.messages.deleteError'));
    }
  });

  // Check category items count mutation
  const checkItemsCountMutation = useMutation({
    mutationFn: categoriesService.getCategoryItemsCount,
    onSuccess: (response) => {
      setItemsCountCheck({
        itemsCount: response.data.itemsCount,
        canDelete: response.data.canDelete
      });
      setDeleteDialogOpen(true);
    },
    onError: (error: any) => {
      setDeletionError(error.message || t('categories.messages.checkItemsError'));
    }
  });

  // Extract categories and pagination from response
  const categories = categoriesResponse?.data?.categories || [];
  const pagination = categoriesResponse?.data?.pagination;

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle delete category
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeletionError(null);
    setItemsCountCheck(null);
    checkItemsCountMutation.mutate(category.id);
  };

  // Handle edit category
  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCategoryToEdit(null);
  };

  const handleEditSuccess = (updatedCategory: Category) => {
    // The form will handle query invalidation, so we just need to close the dialog
    setEditDialogOpen(false);
    setCategoryToEdit(null);
  };

  const handleDeleteConfirm = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    setDeletionError(null);
    setItemsCountCheck(null);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    
    // Always show first page
    if (totalPages > 0) pages.push(1);
    
    // Add pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    
    if (start > 2) pages.push('...');
    
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    if (end < totalPages - 1) pages.push('...');
    
    // Always show last page
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  // Loading state
  if (isLoading && !categoriesResponse) {
    return (
      <Card className="dashboard-card rounded-2xl">
        <CardHeader>
          <CardTitle className="dashboard-text-primary flex items-center gap-3">
            <Folder className="h-6 w-6" />
            {t('categories.list.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="dashboard-text-secondary text-center py-8">
            {t('categories.list.loading')}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="dashboard-card rounded-2xl">
        <CardHeader>
          <CardTitle className="dashboard-text-primary flex items-center gap-3">
            <Folder className="h-6 w-6" />
            {t('categories.list.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error.message || t('errors.loadingError')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no categories found)
  if (categories.length === 0) {
    const isSearchActive = debouncedSearch.length >= 2;
    
    return (
      <Card className="dashboard-card rounded-2xl">
        <CardHeader>
          <CardTitle className="dashboard-text-primary flex items-center gap-3">
            <Folder className="h-6 w-6" />
            {t('categories.list.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search input */}
          {showSearch && (
            <div className="mb-6">
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${
                  isRTL ? 'right-3' : 'left-3'
                }`} />
                <Input
                  type="text"
                  placeholder={t('categories.list.search.placeholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`dashboard-input rounded-xl ${isRTL ? 'pr-10' : 'pl-10'}`}
                />
              </div>
              {searchTerm.length > 0 && searchTerm.length < 2 && (
                <p className="dashboard-text-muted text-sm mt-2">
                  {t('categories.list.search.minLength')}
                </p>
              )}
            </div>
          )}

          <div className="text-center py-12">
            <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="dashboard-text-primary text-lg font-semibold mb-2">
              {isSearchActive 
                ? t('categories.list.search.noResults')
                : t('categories.list.empty')
              }
            </h3>
            <p className="dashboard-text-muted max-w-md mx-auto">
              {isSearchActive 
                ? t('categories.list.search.noResultsDescription')
                : t('categories.list.emptyDescription')
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main categories list display
  return (
    <Card className="dashboard-card rounded-2xl">
      <CardHeader>
        <CardTitle className="dashboard-text-primary flex items-center gap-3">
          <Folder className="h-6 w-6" />
          {t('categories.list.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search input */}
        {showSearch && (
          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${
                isRTL ? 'right-3' : 'left-3'
              }`} />
              <Input
                type="text"
                placeholder={t('categories.list.search.placeholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className={`dashboard-input rounded-xl ${isRTL ? 'pr-10' : 'pl-10'}`}
              />
            </div>
            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <p className="dashboard-text-muted text-sm mt-2">
                {t('categories.list.search.minLength')}
              </p>
            )}
          </div>
        )}

        {/* Pagination info */}
        {pagination && (
          <div className="flex items-center justify-between mb-4 text-sm dashboard-text-muted">
            <span>
              {t('categories.list.pagination.showing', {
                start: (pagination.page - 1) * pagination.limit + 1,
                end: Math.min(pagination.page * pagination.limit, pagination.total),
                total: formatNumber(pagination.total)
              })}
            </span>
            {pagination.totalPages > 1 && (
              <span>
                {t('categories.list.pagination.page', {
                  current: formatNumber(pagination.page),
                  total: formatNumber(pagination.totalPages)
                })}
              </span>
            )}
          </div>
        )}

        {/* Categories list */}
        <div className="space-y-4 mb-6">
          {categories.map((category: Category) => (
            <Card 
              key={category.id} 
              className="border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="dashboard-text-primary font-semibold text-lg mb-2">
                      {category.name}
                    </h4>
                    
                    {category.description && (
                      <p className="dashboard-text-secondary mb-3 text-sm leading-relaxed">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs dashboard-text-muted">
                      {/* Items count */}
                      {typeof category.itemsCount === 'number' && (
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>
                            {formatNumber(category.itemsCount)} {t('categories.list.columns.itemsCount')}
                          </span>
                        </div>
                      )}
                      
                      {/* Created date */}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {t('categories.list.columns.createdAt')}: {formatDate(category.createdAt)}
                        </span>
                      </div>
                      
                      {/* Updated date */}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {t('categories.list.columns.updatedAt')}: {formatDate(category.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                    {/* Action buttons for edit and delete */}
                    <div className="flex items-center gap-2">
                      {/* Edit button - Now enabled with permission check */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditClick(category)}
                        disabled={!canUpdate('categories') || checkItemsCountMutation.isPending || deleteCategoryMutation.isPending}
                        title={t('categories.actions.edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {/* Delete button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(category)}
                        disabled={checkItemsCountMutation.isPending || deleteCategoryMutation.isPending}
                        title={t('categories.actions.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {/* Previous button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              className="flex items-center gap-1"
            >
              {isRTL ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {t('categories.list.pagination.previous')}
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-2 dashboard-text-muted">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={pagination.page === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(Number(page))}
                    disabled={isLoading}
                    className="min-w-[32px]"
                  >
                    {formatNumber(Number(page))}
                  </Button>
                )
              ))}
            </div>

            {/* Next button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="flex items-center gap-1"
            >
              {t('categories.list.pagination.next')}
              {isRTL ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Loading overlay for pagination */}
        {isLoading && categoriesResponse && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl">
            <div className="dashboard-text-secondary">
              {t('categories.list.loading')}
            </div>
          </div>
        )}

        {/* Error display for deletion */}
        {deletionError && (
          <Alert className="border-red-200 bg-red-50 mt-4">
            <AlertDescription className="text-red-800">
              {deletionError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {/* Delete Category Dialog */}
      <DeleteCategoryDialog
        category={categoryToDelete}
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCategoryMutation.isPending}
        hasAssociatedItems={itemsCountCheck ? !itemsCountCheck.canDelete : false}
        associatedItemsCount={itemsCountCheck?.itemsCount || 0}
      />

      {/* Edit Category Form */}
      {categoryToEdit && (
        <EditCategoryForm
          category={categoryToEdit}
          isOpen={editDialogOpen}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </Card>
  );
}

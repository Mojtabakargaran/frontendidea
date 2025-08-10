'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, Package, Filter, Eye, Download, MoreHorizontal, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InventoryExportDialog from '@/components/inventory/inventory-export-dialog';
import { inventoryService, categoriesService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import { useLocaleFormatting as useGlobalLocaleFormatting } from '@/hooks/use-locale-formatting';
import { formatDate as formatDateUtil } from '@/lib/locale-formatting';
import type { 
  InventoryListParams, 
  InventoryItem, 
  ItemType, 
  AvailabilityStatus,
  TenantLocale,
  TenantLanguage,
  Category
} from '@/types';
import { InventoryItemStatus, ExportType } from '@/types';

export default function InventoryItemsList() {
  const { t, i18n } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const { config } = useGlobalLocaleFormatting();
  const router = useRouter();

  // Memoize the date formatting function to re-compute when language changes
  const formatDate = React.useCallback((dateString: string) => {
    // Create a locale-specific config based on current language
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

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | 'all'>('all');
  const [showArchivedItems, setShowArchivedItems] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Construct query parameters
  const queryParams: InventoryListParams = {
    page: currentPage,
    limit: 25,
    search: searchTerm || undefined,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    itemType: itemTypeFilter === 'all' ? undefined : itemTypeFilter,
    availabilityStatus: statusFilter === 'all' ? undefined : statusFilter,
    status: showArchivedItems ? InventoryItemStatus.ARCHIVED : undefined,
    sortBy,
    sortOrder,
  };

  // Fetch inventory items
  const {
    data: inventoryData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory-items', queryParams],
    queryFn: () => inventoryService.getInventoryItems(queryParams),
    retry: 1,
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', { page: 1, limit: 50 }], // Use same pattern as categories list
    queryFn: () => categoriesService.getCategories({ page: 1, limit: 50 }),
    retry: 1,
  });

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Handle filter changes
  const handleCategoryFilter = useCallback((value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  }, []);

  const handleItemTypeFilter = useCallback((value: string) => {
    setItemTypeFilter(value as ItemType);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value as AvailabilityStatus);
    setCurrentPage(1);
  }, []);

  const handleArchivedToggle = useCallback((checked: boolean) => {
    setShowArchivedItems(checked);
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setItemTypeFilter('all');
    setStatusFilter('all');
    setShowArchivedItems(false);
    setCurrentPage(1);
  }, []);

  // Handle view item details
  const handleViewItem = useCallback((itemId: string) => {
    router.push(`/dashboard/inventory/${itemId}`);
  }, [router]);

  // Handle edit item
  const handleEditItem = useCallback((itemId: string) => {
    router.push(`/dashboard/inventory/${itemId}/edit`);
  }, [router]);

  // Handle item selection
  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && inventoryData?.data) {
      setSelectedItems(inventoryData.data.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [inventoryData?.data]);

  // Handle bulk export
  const handleBulkExport = useCallback(() => {
    if (selectedItems.length > 0) {
      setShowExportDialog(true);
    }
  }, [selectedItems]);

  // Get status badge variant
  const getStatusVariant = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available': return 'default';
      case 'rented': return 'secondary';
      case 'maintenance': return 'outline';
      case 'damaged': return 'destructive';
      case 'lost': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="dashboard-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dashboard-text-primary">
              {t('inventory.items.title')}
            </h2>
            <p className="dashboard-text-muted">
              {inventoryData?.meta.total || 0} {t('inventory.items.itemsCount')}
              {selectedItems.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedItems.length} {t('inventory.items.selected')}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {selectedItems.length > 0 && (
          <Button
            onClick={handleBulkExport}
            className="dashboard-button-primary"
            size="sm"
          >
            <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('inventory.items.actions.exportSelected')}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            type="text"
            placeholder={t('inventory.items.search.placeholder')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={`dashboard-input ${isRTL ? 'pr-10' : 'pl-10'}`}
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="dashboard-input">
            <SelectValue placeholder={t('inventory.items.filters.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.items.filters.allCategories')}</SelectItem>
            {categoriesData?.data.categories.map((category: Category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Item Type Filter */}
        <Select value={itemTypeFilter} onValueChange={handleItemTypeFilter}>
          <SelectTrigger className="dashboard-input">
            <SelectValue placeholder={t('inventory.items.filters.itemType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.items.filters.allTypes')}</SelectItem>
            <SelectItem value="serialized">{t('inventory.itemType.serialized')}</SelectItem>
            <SelectItem value="non_serialized">{t('inventory.itemType.non_serialized')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="dashboard-input">
            <SelectValue placeholder={t('inventory.items.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.items.filters.allStatuses')}</SelectItem>
            <SelectItem value="available">{t('inventory.status.available')}</SelectItem>
            <SelectItem value="rented">{t('inventory.status.rented')}</SelectItem>
            <SelectItem value="maintenance">{t('inventory.status.maintenance')}</SelectItem>
            <SelectItem value="damaged">{t('inventory.status.damaged')}</SelectItem>
            <SelectItem value="lost">{t('inventory.status.lost')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Options */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Checkbox
            id="show-archived"
            checked={showArchivedItems}
            onCheckedChange={handleArchivedToggle}
          />
          <label 
            htmlFor="show-archived" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dashboard-text-secondary"
          >
            <span className="text-sm font-bold">{t('inventory.items.filters.showArchived')}</span>
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(searchTerm || (categoryFilter && categoryFilter !== 'all') || (itemTypeFilter && itemTypeFilter !== 'all') || (statusFilter && statusFilter !== 'all') || showArchivedItems) && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('inventory.items.filters.clear')}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>
            {t('inventory.items.errors.loadFailed')}
            <Button
              variant="link"
              size="sm"
              onClick={() => refetch()}
              className="ml-2 p-0 h-auto"
            >
              {t('common.tryAgain')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Items Table */}
      {!isLoading && !error && (
        <>
          {inventoryData?.data.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="dashboard-text-muted text-lg mb-2">
                {searchTerm || categoryFilter || itemTypeFilter || statusFilter
                  ? t('inventory.items.noResultsFound')
                  : t('inventory.items.noItems')
                }
              </p>
              {!searchTerm && !categoryFilter && !itemTypeFilter && !statusFilter && (
                <p className="dashboard-text-muted text-sm">
                  {t('inventory.items.createFirstItem')}
                </p>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className={`w-12 table-checkbox-cell font-semibold dashboard-text-primary`} data-rtl={isRTL}>
                      <Checkbox
                        checked={selectedItems.length === inventoryData?.data.length && inventoryData?.data.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label={t('inventory.items.selectAll')}
                      />
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.name')}
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.category')}
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.type')}
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.serialOrQuantity')}
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.status')}
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.created')}
                    </TableHead>
                    <TableHead className={`font-semibold dashboard-text-primary w-32 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('inventory.items.table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData?.data.map((item: InventoryItem) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="table-checkbox-cell" data-rtl={isRTL}>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          aria-label={t('inventory.items.selectItem', { name: item.name })}
                        />
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div>
                          <p className="font-medium dashboard-text-primary">{item.name}</p>
                          {item.description && (
                            <p className="text-sm dashboard-text-muted truncate max-w-48">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="dashboard-text-secondary">
                          {item.categoryName}
                        </span>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <Badge variant="outline" className="text-xs">
                          {t(`inventory.itemType.${item.itemType}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {item.itemType === 'serialized' ? (
                          <span className="font-mono text-sm dashboard-text-secondary">
                            {item.serialNumber || '-'}
                          </span>
                        ) : (
                          <span className="dashboard-text-secondary">
                            {item.quantity} {item.quantityUnit || ''}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <Badge variant={getStatusVariant(item.availabilityStatus)} className="text-xs">
                          {t(`inventory.status.${item.availabilityStatus}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="text-sm dashboard-text-muted">
                          {formatDate(item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-1 ${isRTL ? 'justify-start' : 'justify-start'}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-9 h-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            title={t('inventory.items.actions.view')}
                            onClick={() => handleViewItem(item.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-9 h-9 p-0 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                            title={t('inventory.items.actions.edit')}
                            onClick={() => handleEditItem(item.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {inventoryData && inventoryData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm dashboard-text-muted">
                {t('common.pagination.showing', {
                  start: (inventoryData.meta.page - 1) * inventoryData.meta.limit + 1,
                  end: Math.min(inventoryData.meta.page * inventoryData.meta.limit, inventoryData.meta.total),
                  total: inventoryData.meta.total
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!inventoryData.meta.hasPrevious}
                >
                  {t('common.pagination.previous')}
                </Button>
                <span className="text-sm dashboard-text-secondary px-3">
                  {t('common.pagination.pageOf', {
                    current: inventoryData.meta.page,
                    total: inventoryData.meta.totalPages
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!inventoryData.meta.hasNext}
                >
                  {t('common.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Export Dialog */}
      {showExportDialog && selectedItems.length > 0 && inventoryData?.data && (
        <InventoryExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          selectedItems={inventoryData.data.filter(item => selectedItems.includes(item.id))}
          exportType={ExportType.MULTIPLE_ITEMS}
        />
      )}
    </div>
  );
}

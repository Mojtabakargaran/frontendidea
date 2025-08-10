'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  Tag, 
  Hash, 
  FileText, 
  Shield, 
  AlertCircle,
  Download,
  Edit,
  Settings
} from 'lucide-react';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InventoryExportDialog from '@/components/inventory/inventory-export-dialog';
import ChangeStatusDialog from '@/components/inventory/change-status-dialog';
import { inventoryService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import { useClientPermissions } from '@/hooks/use-permissions';
import { useLocaleFormatting as useGlobalLocaleFormatting } from '@/hooks/use-locale-formatting';
import { formatDate as formatDateUtil } from '@/lib/locale-formatting';
import type { 
  AvailabilityStatus,
  InventoryItemStatus,
  TenantLocale,
  TenantLanguage
} from '@/types';
import { ExportType } from '@/types';

export default function InventoryItemDetailsPage() {
  const { t, i18n } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const { config } = useGlobalLocaleFormatting();
  const { canRead, canUpdate, canExport } = useClientPermissions();
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;

  const [showExportDialog, setShowExportDialog] = React.useState(false);

  // Check if user has permission to view inventory
  const canViewInventory = canRead('inventory');
  const canUpdateInventory = canUpdate('inventory');
  const canExportInventory = canExport('inventory');

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

  // Fetch inventory item details
  const {
    data: itemData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: () => inventoryService.getInventoryItem(itemId),
    retry: 1,
  });

  const item = itemData?.data;

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

  // Get item status badge variant
  const getItemStatusVariant = (status: InventoryItemStatus) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'outline';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/dashboard/inventory');
  };

  // Handle export
  const handleExport = () => {
    setShowExportDialog(true);
  };

  // Handle edit
  const handleEdit = () => {
    router.push(`/dashboard/inventory/${itemId}/edit`);
  };

  // Check permissions
  if (!canViewInventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <DashboardHeader companyName="" />
        <DashboardNavigation />
        
        <main className="pt-16 lg:mr-64">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="text-center py-12">
              <div className="dashboard-card max-w-md mx-auto p-8">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold dashboard-text-primary mb-4">
                  {t('inventory.accessDenied')}
                </h1>
                <p className="dashboard-text-secondary mb-8">
                  {t('inventory.accessDeniedDescription')}
                </p>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('common.goBack')}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <DashboardHeader companyName="" />
      <DashboardNavigation />
      
      <main className="pt-16 lg:mr-64">
        <div className="max-w-screen-2xl mx-auto p-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="dashboard-text-secondary hover:dashboard-text-primary"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('inventory.details.backToList')}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('inventory.details.errors.loadFailed')}
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

          {/* Item Details */}
          {!isLoading && !error && item && (
            <>
              {/* Page Header */}
              <div className="dashboard-card rounded-2xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {item.name}
                      </h1>
                      <p className="dashboard-text-secondary">
                        {item.categoryName} • {t(`inventory.itemType.${item.itemType}`)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {canExportInventory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="min-h-[44px]"
                      >
                        <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('inventory.details.actions.export')}
                      </Button>
                    )}
                    {canUpdateInventory && (
                      <ChangeStatusDialog item={item}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px]"
                        >
                          <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('inventory.details.actions.changeStatus')}
                        </Button>
                      </ChangeStatusDialog>
                    )}
                    {canUpdateInventory && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleEdit}
                        className="dashboard-button-primary min-h-[44px]"
                      >
                        <Edit className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('inventory.details.actions.edit')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Item Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="dashboard-card rounded-2xl p-6">
                  <h2 className="text-xl font-bold dashboard-text-primary mb-6 flex items-center gap-3">
                    <FileText className="w-5 h-5" />
                    {t('inventory.details.sections.basicInfo')}
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Item Name */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.form.fields.name.label')}
                      </label>
                      <p className="dashboard-text-primary font-medium mt-1">
                        {item.name}
                      </p>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <div>
                        <label className="text-sm font-medium dashboard-text-secondary">
                          {t('inventory.form.fields.description.label')}
                        </label>
                        <p className="dashboard-text-primary mt-1 whitespace-pre-wrap">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.form.fields.category.label')}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag className="w-4 h-4 dashboard-text-muted" />
                        <span className="dashboard-text-primary font-medium">
                          {item.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Item Type */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.form.fields.itemType.label')}
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-sm">
                          {t(`inventory.itemType.${item.itemType}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Tracking */}
                <div className="dashboard-card rounded-2xl p-6">
                  <h2 className="text-xl font-bold dashboard-text-primary mb-6 flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    {t('inventory.details.sections.statusTracking')}
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Availability Status */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.details.fields.availabilityStatus')}
                      </label>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(item.availabilityStatus)} className="text-sm">
                          {t(`inventory.status.${item.availabilityStatus}`)}
                        </Badge>
                      </div>
                    </div>

                    {/* Item Status */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.details.fields.itemStatus')}
                      </label>
                      <div className="mt-1">
                        <Badge variant={getItemStatusVariant(item.status)} className="text-sm">
                          {t(`inventory.details.status.${item.status}`)}
                        </Badge>
                      </div>
                    </div>

                    {/* Serial Number or Quantity */}
                    {item.itemType === 'serialized' ? (
                      <div>
                        <label className="text-sm font-medium dashboard-text-secondary">
                          {t('inventory.form.fields.serialNumber.label')}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Hash className="w-4 h-4 dashboard-text-muted" />
                          <span className="font-mono dashboard-text-primary font-medium">
                            {item.serialNumber || '-'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium dashboard-text-secondary">
                          {t('inventory.details.fields.quantity')}
                        </label>
                        <div className="mt-1">
                          <span className="dashboard-text-primary font-medium">
                            {item.quantity} {item.quantityUnit || ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Created Date */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.details.fields.createdAt')}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 dashboard-text-muted" />
                        <span className="dashboard-text-primary">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div>
                      <label className="text-sm font-medium dashboard-text-secondary">
                        {t('inventory.details.fields.updatedAt')}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 dashboard-text-muted" />
                        <span className="dashboard-text-primary">
                          {formatDate(item.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Export Dialog */}
          {showExportDialog && item && (
            <InventoryExportDialog
              isOpen={showExportDialog}
              onClose={() => setShowExportDialog(false)}
              selectedItems={[item]}
              exportType={ExportType.SINGLE_ITEM}
            />
          )}
        </div>
      </main>
    </div>
  );
}

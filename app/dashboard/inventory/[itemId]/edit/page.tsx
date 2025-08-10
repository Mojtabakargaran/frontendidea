'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Settings, Hash, Package } from 'lucide-react';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EditInventoryItemForm from '@/components/inventory/edit-inventory-item-form';
import UpdateSerializedForm from '@/components/inventory/update-serialized-form';
import UpdateQuantityForm from '@/components/inventory/update-quantity-form';
import { inventoryService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import { useClientPermissions } from '@/hooks/use-permissions';
import { ItemType } from '@/types';

export default function EditInventoryItemPage() {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const { canUpdate } = useClientPermissions();
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;

  // Check if user has permission to update inventory
  const canUpdateInventory = canUpdate('inventory');

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

  // Handle back navigation
  const handleBack = () => {
    router.push(`/dashboard/inventory/${itemId}`);
  };

  // Handle successful update
  const handleSuccess = () => {
    router.push(`/dashboard/inventory/${itemId}`);
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/dashboard/inventory/${itemId}`);
  };

  // Check permissions
  if (!canUpdateInventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <DashboardHeader companyName="" />
        <DashboardNavigation />
        
        <main className="pt-16 lg:mr-64">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="text-center py-12">
              <div className="dashboard-card max-w-md mx-auto p-8">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold dashboard-text-primary mb-4">
                  {t('inventory.edit.accessDenied')}
                </h1>
                <p className="dashboard-text-secondary mb-8">
                  {t('inventory.edit.accessDeniedDescription')}
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
              {t('inventory.edit.backToDetails')}
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
              <AlertDescription>
                {t('inventory.details.errors.loadFailed')}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => refetch()}
                  className={`p-0 h-auto ${isRTL ? 'mr-2' : 'ml-2'}`}
                >
                  {t('common.tryAgain')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Edit Forms with Tabs */}
          {!isLoading && !error && item && (
            <div className="dashboard-card rounded-2xl p-8">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className={`grid w-full ${item.itemType === ItemType.SERIALIZED || item.itemType === ItemType.NON_SERIALIZED ? 'grid-cols-2' : 'grid-cols-1'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* In RTL, render tabs in reverse order */}
                  {isRTL ? (
                    <>
                      {item.itemType === ItemType.SERIALIZED && (
                        <TabsTrigger value="serialized" className="flex items-center gap-2 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                          <Hash className="w-4 h-4" />
                          {t('inventory.edit.tabs.serialized')}
                        </TabsTrigger>
                      )}
                      {item.itemType === ItemType.NON_SERIALIZED && (
                        <TabsTrigger value="quantity" className="flex items-center gap-2 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                          <Package className="w-4 h-4" />
                          {t('inventory.edit.tabs.quantity')}
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="basic" className="flex items-center gap-2 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                        <Settings className="w-4 h-4" />
                        {t('inventory.edit.tabs.basicInfo')}
                      </TabsTrigger>
                    </>
                  ) : (
                    <>
                      <TabsTrigger value="basic" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {t('inventory.edit.tabs.basicInfo')}
                      </TabsTrigger>
                      {item.itemType === ItemType.SERIALIZED && (
                        <TabsTrigger value="serialized" className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          {t('inventory.edit.tabs.serialized')}
                        </TabsTrigger>
                      )}
                      {item.itemType === ItemType.NON_SERIALIZED && (
                        <TabsTrigger value="quantity" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {t('inventory.edit.tabs.quantity')}
                        </TabsTrigger>
                      )}
                    </>
                  )}
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="mt-6">
                  <EditInventoryItemForm
                    item={item}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </TabsContent>

                {/* Serialized Item Updates Tab */}
                {item.itemType === ItemType.SERIALIZED && (
                  <TabsContent value="serialized" className="mt-6">
                    <UpdateSerializedForm
                      item={item}
                      onSuccess={handleSuccess}
                      onCancel={handleCancel}
                    />
                  </TabsContent>
                )}

                {/* Quantity Updates Tab */}
                {item.itemType === ItemType.NON_SERIALIZED && (
                  <TabsContent value="quantity" className="mt-6">
                    <UpdateQuantityForm
                      item={item}
                      onSuccess={handleSuccess}
                      onCancel={handleCancel}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

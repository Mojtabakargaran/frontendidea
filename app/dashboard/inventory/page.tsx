'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import InventoryItemsList from '@/components/inventory/inventory-items-list';
import CreateInventoryItemForm from '@/components/inventory/create-inventory-item-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDirection } from '@/hooks/use-direction';
import { useClientPermissions } from '@/hooks/use-permissions';

export default function InventoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const { canRead, canCreate } = useClientPermissions();

  // Check if user has permission to view inventory
  const canViewInventory = canRead('inventory');
  
  if (!canViewInventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <DashboardHeader companyName="" />
        <DashboardNavigation />
        
        <main className="pt-16 lg:mr-64">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="text-center py-12">
              <Card className="dashboard-card max-w-md mx-auto">
                <CardContent className="p-8">
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
                </CardContent>
              </Card>
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
        <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <Card className="dashboard-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-md">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {t('inventory.title')}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {t('inventory.subtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Inventory Items List */}
            <div className="xl:col-span-2">
              <InventoryItemsList />
            </div>

            {/* Create Inventory Item Form - Only show if user has create permission */}
            {canCreate('inventory') && (
              <div className="xl:col-span-1">
                <CreateInventoryItemForm />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

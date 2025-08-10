'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

import { dashboardService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import DashboardInfoCards from '@/components/dashboard-info-cards';
import type { ApiError } from '@/types';
import '@/i18n';

function DashboardContent() {
  const { t } = useTranslation();
  const router = useRouter();

  // Fetch dashboard data using shared QueryClient
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      const apiError = error as unknown as ApiError;
      if (apiError.code === 'auth.SESSION_EXPIRED' || apiError.code === 'auth.UNAUTHORIZED') {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Handle authentication errors
  React.useEffect(() => {
    if (isError && error) {
      const apiError = error as unknown as ApiError;
      if (apiError.code === 'auth.SESSION_EXPIRED' || apiError.code === 'auth.UNAUTHORIZED') {
        router.push('/login');
      }
    }
  }, [isError, error, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 max-w-md w-full mx-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('common.loading')}
                </h2>
                <p className="text-gray-600">
                  {t('dashboard.loading')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !dashboardData) {
    const apiError = error as unknown as ApiError;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {apiError?.code === 'tenant.TENANT_INACTIVE' 
                  ? t('dashboard.messages.tenantInactive')
                  : t('dashboard.messages.loadingError')
                }
              </h2>
              <p className="text-gray-600 mb-6">
                {apiError?.message || t('errors.generic')}
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => refetch()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('common.retry')}
                </Button>
                
                {apiError?.code === 'tenant.TENANT_INACTIVE' && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:support@samanin.com'}
                    className="w-full"
                  >
                    {t('dashboard.messages.contactSupport')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <DashboardHeader
        companyName={dashboardData.data.tenant.companyName}
      />

      {/* Navigation */}
      <DashboardNavigation />

      {/* Main Content */}
      <main className="lg:mr-64 pt-16">
        <div className="max-w-screen-2xl mx-auto p-6">
          {/* Tenant Inactive Warning */}
          {dashboardData.data.tenant.status === 'inactive' && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200 rounded-2xl">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="mr-3 rtl:mr-0 rtl:ml-3">
                <h3 className="font-semibold text-yellow-800">
                  {t('dashboard.messages.tenantInactive')}
                </h3>
                <p className="text-yellow-700 mt-1">
                  {t('dashboard.contactSupportForActivation')}
                </p>
              </div>
            </Alert>
          )}

          {/* Dashboard Content */}
          <DashboardInfoCards data={dashboardData.data} />
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

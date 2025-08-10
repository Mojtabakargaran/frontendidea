'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

import AuditTrailList from '@/components/audit-trail-list';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { hasPermission } from '@/lib/role-utils';
import '@/i18n';

function AuditContent() {
  const { t } = useTranslation();
  const { user } = useUser();

  // Check if user has audit permissions (? - BR01)
  if (!user || !hasPermission(user.roleName, 'audit')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <DashboardHeader companyName="" />

        {/* Navigation */}
        <DashboardNavigation />

        {/* Main Content */}
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="dashboard-card max-w-md w-full">
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold dashboard-text-primary mb-2">
                    {t('audit.accessDenied.title')}
                  </h2>
                  <p className="dashboard-text-secondary">
                    {t('audit.accessDenied.message')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <DashboardHeader companyName="" />

      {/* Navigation */}
      <DashboardNavigation />

      {/* Main Content */}
      <main className="lg:mr-64 pt-16">
        <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <Card className="dashboard-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-md">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {t('audit.title')}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {t('audit.subtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Audit Trail List */}
          <AuditTrailList />
        </div>
      </main>
    </div>
  );
}

export default function AuditPage() {
  return <AuditContent />;
}

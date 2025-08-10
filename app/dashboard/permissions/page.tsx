'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, History, ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import { RolePermissionsManager } from '@/components/role-permissions-manager';
import { PermissionsAuditList } from '@/components/permissions-audit-list';
import { useClientPermissions } from '@/hooks/use-permissions';
import { getRoleDisplayName } from '@/lib/role-utils';
import { userService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { Role } from '@/types';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

function PermissionsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canManagePermissions } = useClientPermissions();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => userService.getRoles(),
    enabled: canManagePermissions,
  });

  const roles = rolesData?.data || [];

  if (!canManagePermissions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <DashboardHeader companyName="" />

        {/* Navigation */}
        <DashboardNavigation />

        {/* Main Content */}
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="text-center py-12">
              <Card className="dashboard-card max-w-md mx-auto">
                <CardContent className="p-8">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold dashboard-text-primary mb-4">
                    {t('permissions.accessDenied')}
                  </h1>
                  <p className="dashboard-text-secondary mb-8">
                    {t('permissions.accessDeniedDescription')}
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

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <DashboardHeader companyName="" />

        {/* Navigation */}
        <DashboardNavigation />

        {/* Main Content */}
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="mb-6">
              <Button
                onClick={() => setSelectedRole(null)}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm border-white/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('permissions.backToOverview')}
              </Button>
            </div>
            <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl">
              <CardContent className="p-8">
                <RolePermissionsManager role={selectedRole} onClose={() => setSelectedRole(null)} />
              </CardContent>
            </Card>
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
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {t('permissions.title')}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {t('permissions.subtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <Tabs defaultValue="roles" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 bg-gray-100">
                  {/* <TabsTrigger 
                    value="audit" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {t('permissions.tabs.auditLogs')}
                  </TabsTrigger> */}
                  <TabsTrigger 
                    value="roles" 
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {t('permissions.tabs.roleManagement')}
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="roles" className="space-y-6">
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('permissions.roleManagement.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('permissions.roleManagement.description')}
                </p>
              </div>

              {rolesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse bg-white/20 border-white/30">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-white/20 rounded w-3/4"></div>
                          <div className="h-4 bg-white/20 rounded w-full"></div>
                          <div className="h-4 bg-white/20 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 justify-start flex-row-reverse">
                  {roles
                    .slice() // Create a copy to avoid mutating the original array
                    .sort((a, b) => {
                      // Define the correct RTL visual order (from right to left in RTL layout)
                      // This ensures tenant_owner appears first on the right, followed by admin, manager, etc.
                      const roleOrder = ['tenant_owner', 'admin', 'manager', 'employee', 'staff'];
                      return roleOrder.indexOf(a.name) - roleOrder.indexOf(b.name);
                    })
                    .map((role) => (
                    <Card 
                      key={role.id} 
                      className="bg-white/95 backdrop-blur-sm border-white/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                      onClick={() => setSelectedRole(role)}
                    >
                      <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          {getRoleDisplayName(role.name, t)}
                        </CardTitle>
                        <CardDescription className="text-center">
                          {t(`permissions.roleDescriptions.${role.name}`, getRoleDisplayName(role.name, t))}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
                        >
                          {t('permissions.managePermissions')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="audit" className="space-y-6" dir="rtl">
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('permissions.audit.title')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('permissions.audit.description')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6" dir="rtl">
                <PermissionsAuditList />
              </div>
            </TabsContent>
          </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function PermissionsPage() {
  return <PermissionsContent />;
}

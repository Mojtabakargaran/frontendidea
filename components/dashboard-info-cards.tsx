'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  User,
  Clock,
  Shield,
  Server,
  Activity,
  Package,
  FileText,
  BarChart3,
  ArrowRight
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate, formatNumber, formatCurrency } from '@/lib/locale-formatting';
import type { DashboardResponse, TenantLocale, TenantLanguage } from '@/types';

interface DashboardInfoCardsProps {
  data: DashboardResponse['data'];
}

export default function DashboardInfoCards({ data }: DashboardInfoCardsProps) {
  const { t, i18n } = useTranslation();
  const { config } = useGlobalLocaleFormatting();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  // Memoize the date formatting function to re-compute when language changes
  const formatLocalizedDate = React.useCallback((dateString: string) => {
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
    return formatDate(dateString, languageSpecificConfig);
  }, [config, i18n.language]);

  const formatLocalizedNumber = (number: number) => {
    return formatNumber(number, config);
  };

  const StatusBadge = ({ status, type }: { status: string; type: 'tenant' | 'service' }) => {
    const isActive = status === 'active' || status === 'operational';
    const Icon = isActive ? CheckCircle : XCircle;
    const colorClass = isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
    
    return (
      <div className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {t(type === 'tenant' ? `dashboard.status.${status}` : `dashboard.status.${status}`)}
        </span>
      </div>
    );
  };

  const InfoCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    badge 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ComponentType<{ className?: string }>; 
    description?: string;
    badge?: React.ReactNode;
  }) => (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        {badge}
      </div>
    </Card>
  );

  const ModuleCard = ({ 
    title, 
    description, 
    icon: Icon 
  }: { 
    title: string; 
    description: string; 
    icon: React.ComponentType<{ className?: string }>; 
  }) => (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl opacity-60">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
            {t('dashboard.navigation.comingSoon')}
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 rounded-3xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcome')}، {data.user.fullName}
          </h1>
          <p className="text-blue-100 text-lg">
            {t('dashboard.info.companyName')}: {data.tenant.companyName}
          </p>
        </div>
      </div>

      {/* Tenant Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title={t('dashboard.info.companyName')}
          value={data.tenant.companyName}
          icon={Building}
        />
        
        <InfoCard
          title={t('dashboard.info.registrationDate')}
          value={formatLocalizedDate(data.tenant.registrationDate)}
          icon={Calendar}
        />
        
        <InfoCard
          title={t('dashboard.info.userCount')}
          value={formatLocalizedNumber(data.tenant.userCount)}
          icon={Users}
        />
        
        <InfoCard
          title={t('dashboard.info.status')}
          value={t(`dashboard.status.${data.tenant.status}`)}
          icon={data.tenant.status === 'active' ? CheckCircle : XCircle}
          badge={<StatusBadge status={data.tenant.status} type="tenant" />}
        />
      </div>

      {/* User Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title={t('dashboard.info.lastLogin')}
          value={formatLocalizedDate(data.user.lastLogin)}
          icon={Clock}
        />
        
        <InfoCard
          title={t('dashboard.info.role')}
          value={t(`common.roles.${data.user.role}`)}
          icon={Shield}
        />
        
        <InfoCard
          title={t('dashboard.info.tenantId')}
          value={data.tenant.id}
          icon={User}
        />
      </div>

      {/* System Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title={t('dashboard.info.systemVersion')}
          value={data.systemInfo.version}
          icon={Server}
        />
        
        <InfoCard
          title={t('dashboard.info.lastUpdate')}
          value={formatLocalizedDate(data.systemInfo.lastUpdate)}
          icon={Activity}
        />
        
        <InfoCard
          title={t('dashboard.info.serviceStatus')}
          value={t(`dashboard.status.${data.systemInfo.serviceStatus}`)}
          icon={data.systemInfo.serviceStatus === 'operational' ? CheckCircle : XCircle}
          badge={<StatusBadge status={data.systemInfo.serviceStatus} type="service" />}
        />
      </div>

      {/* Future Modules Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('dashboard.futureModules')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModuleCard
            title={t('dashboard.modules.inventory.title')}
            description={t('dashboard.modules.inventory.description')}
            icon={Package}
          />
          
          <ModuleCard
            title={t('dashboard.modules.customers.title')}
            description={t('dashboard.modules.customers.description')}
            icon={Users}
          />
          
          <ModuleCard
            title={t('dashboard.modules.rentals.title')}
            description={t('dashboard.modules.rentals.description')}
            icon={FileText}
          />
          
          <ModuleCard
            title={t('dashboard.modules.reports.title')}
            description={t('dashboard.modules.reports.description')}
            icon={BarChart3}
          />
        </div>
      </div>
    </div>
  );
}

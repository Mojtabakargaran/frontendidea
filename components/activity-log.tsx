'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Calendar, 
  Globe, 
  Monitor,
  RefreshCw,
  ChevronDown,
  LogIn,
  LogOut,
  UserCheck,
  Lock,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate } from '@/lib/locale-formatting';
import { profileService } from '@/services/api';
import type { UserActivityResponse, ApiError, TenantLocale, TenantLanguage } from '@/types';

export default function ActivityLog() {
  const { t, i18n } = useTranslation();
  const { config } = useGlobalLocaleFormatting();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

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

  const {
    data: activityData,
    isLoading,
    refetch
  } = useQuery<UserActivityResponse, ApiError>({
    queryKey: ['user-activity', page, limit],
    queryFn: () => profileService.getActivity({ page, limit }),
    enabled: typeof window !== 'undefined',
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-orange-600" />;
      case 'profile_updated':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'password_changed':
        return <Lock className="w-4 h-4 text-purple-600" />;
      case 'session_terminated':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'logout':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'profile_updated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'password_changed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'session_terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeviceInfo = (userAgent: string | null | undefined) => {
    if (!userAgent) {
      return t('profile.activity.devices.unknown');
    }
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return t('profile.activity.devices.mobile');
    }
    if (userAgent.includes('Chrome')) return t('profile.activity.devices.chrome');
    if (userAgent.includes('Firefox')) return t('profile.activity.devices.firefox');
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return t('profile.activity.devices.safari');
    if (userAgent.includes('Edge')) return t('profile.activity.devices.edge');
    return t('profile.activity.devices.browser');
  };

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
        <CardContent className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin me-3" />
          <span>{t('profile.activity.loading')}</span>
        </CardContent>
      </Card>
    );
  }

  const activities = activityData?.data.activities || [];
  const pagination = activityData?.data.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('profile.activity.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('profile.activity.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white/95"
        >
          <RefreshCw className="w-4 h-4 me-2" />
          {t('profile.activity.buttons.refresh')}
        </Button>
      </div>

      {/* Activity List */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            {t('profile.activity.title')}
          </CardTitle>
          {pagination && (
            <p className="text-sm text-gray-600">
              {t('profile.activity.pagination.showing', {
                from: ((page - 1) * limit) + 1,
                to: Math.min(page * limit, pagination.total),
                total: pagination.total
              })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('profile.activity.pagination.noActivity')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.timestamp}-${index}`}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Activity Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    
                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActivityColor(activity.action)}>
                          {activity.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatLocalizedDate(activity.timestamp)}
                        </span>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-3 h-3" />
                          <span>{t('profile.activity.fields.ipAddress')}:</span>
                          <span className="font-mono">{activity.ipAddress}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Monitor className="w-3 h-3" />
                          <span>{t('profile.activity.fields.userAgent')}:</span>
                          <span>{getDeviceInfo(activity.userAgent)}</span>
                        </div>
                      </div>
                      
                      {activity.details && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">
                            {t('profile.activity.fields.details')}:
                          </span>
                          <span className="ms-1">{activity.details}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {t('profile.activity.pagination.pageInfo', { page, totalPages: pagination.totalPages })}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm border-white/30"
                >
                  {t('profile.activity.pagination.previous')}
                </Button>
                <Button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm border-white/30"
                >
                  {t('profile.activity.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

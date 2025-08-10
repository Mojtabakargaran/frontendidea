'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Calendar, 
  X, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate } from '@/lib/locale-formatting';
import { profileService } from '@/services/api';
import type { UserSessionsResponse, ApiError, TenantLocale, TenantLanguage } from '@/types';

export default function SessionsManagement() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { config } = useGlobalLocaleFormatting();
  const [error, setError] = useState<string | null>(null);

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
    data: sessionsData,
    isLoading,
    refetch
  } = useQuery<UserSessionsResponse, ApiError>({
    queryKey: ['user-sessions'],
    queryFn: profileService.getSessions,
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: typeof window !== 'undefined',
  });

  const terminateSessionMutation = useMutation({
    mutationFn: profileService.terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      setError(null);
    },
    onError: (error: ApiError) => {
      setError(error.message);
    }
  });

  const handleTerminateSession = (sessionId: string) => {
    if (confirm(t('common.confirmations.terminateSession'))) {
      terminateSessionMutation.mutate(sessionId);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getDeviceInfo = (userAgent: string) => {
    // Simple user agent parsing
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'مرورگر ناشناخته';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
        <CardContent className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin me-3" />
          <span>در حال بارگذاری نشست‌ها...</span>
        </CardContent>
      </Card>
    );
  }

  const sessions = sessionsData?.data.sessions || [];
  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('profile.sessions.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('profile.sessions.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 me-2" />
          {t('profile.sessions.buttons.refresh')}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Session */}
      {currentSession && (
        <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5 text-green-600" />
              {t('profile.sessions.current')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {t('profile.sessions.fields.ipAddress')}:
                  </span>
                  <span className="font-mono text-sm">
                    {currentSession.ipAddress}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {getDeviceIcon(currentSession.userAgent)}
                  <span className="text-sm text-gray-600">
                    {t('profile.sessions.fields.userAgent')}:
                  </span>
                  <span className="text-sm">
                    {getDeviceInfo(currentSession.userAgent)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {t('profile.sessions.fields.lastActivity')}:
                  </span>
                  <span className="text-sm">
                    {formatLocalizedDate(currentSession.lastActivityAt)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {t('profile.sessions.fields.expires')}:
                  </span>
                  <span className="text-sm">
                    {formatLocalizedDate(currentSession.expiresAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                نشست فعلی
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="w-5 h-5 text-orange-600" />
            {t('profile.sessions.other')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otherSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('profile.sessions.messages.noOtherSessions')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid gap-2 md:grid-cols-2 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {t('profile.sessions.fields.ipAddress')}:
                          </span>
                          <span className="font-mono text-sm">
                            {session.ipAddress}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.userAgent)}
                          <span className="text-sm text-gray-600">
                            {t('profile.sessions.fields.userAgent')}:
                          </span>
                          <span className="text-sm">
                            {getDeviceInfo(session.userAgent)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {t('profile.sessions.fields.lastActivity')}:
                          </span>
                          <span className="text-sm">
                            {formatLocalizedDate(session.lastActivityAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {t('profile.sessions.fields.expires')}:
                          </span>
                          <span className="text-sm">
                            {formatLocalizedDate(session.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleTerminateSession(session.id)}
                      variant="outline"
                      size="sm"
                      disabled={terminateSessionMutation.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 ms-4"
                    >
                      <X className="w-4 h-4" />
                      {t('profile.sessions.buttons.terminate')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

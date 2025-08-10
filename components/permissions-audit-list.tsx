'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, Calendar, Shield, User, 
  CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronDown, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePermissionAudit } from '@/hooks/use-permissions';
import { useClientPermissions } from '@/hooks/use-permissions';
import { CheckResult, PermissionAction, type PermissionAuditParams, TenantLocale, TenantLanguage } from '@/types';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDateTime } from '@/lib/locale-formatting';

export function PermissionsAuditList() {
  const { t, i18n } = useTranslation();
  const { canViewAudit } = useClientPermissions();
  const { config } = useGlobalLocaleFormatting();
  
  // Memoize the date formatting function to re-compute when language changes
  const formatLocalizedDateTime = React.useCallback((dateString: string) => {
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
    return formatDateTime(dateString, languageSpecificConfig);
  }, [config, i18n.language]);
  
  const [filters, setFilters] = useState<PermissionAuditParams>({
    page: 1,
    limit: 25,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = usePermissionAudit(filters);

  // Filter data based on search query
  const filteredChecks = useMemo(() => {
    const permissionChecks = data?.data.permissionChecks || [];
    if (!searchQuery.trim()) return permissionChecks;
    
    const query = searchQuery.toLowerCase();
    return permissionChecks.filter(check => 
      check.user.fullName.toLowerCase().includes(query) ||
      check.user.email.toLowerCase().includes(query) ||
      check.resource.toLowerCase().includes(query) ||
      check.action.toLowerCase().includes(query)
    );
  }, [data?.data.permissionChecks, searchQuery]);

  const pagination = data?.data.pagination;

  if (!canViewAudit) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t('permissions.accessDenied')}
        </AlertDescription>
      </Alert>
    );
  }

  const handleFilterChange = (key: keyof PermissionAuditParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getResultIcon = (result: CheckResult) => {
    switch (result) {
      case CheckResult.GRANTED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case CheckResult.DENIED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResultBadge = (result: CheckResult) => {
    switch (result) {
      case CheckResult.GRANTED:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            {t('permissions.results.granted')}
          </Badge>
        );
      case CheckResult.DENIED:
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            {t('permissions.results.denied')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('permissions.results.unknown')}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('permissions.audit.title')}
          </h2> */}
          {/* <p className="text-gray-600">
            {t('permissions.audit.subtitle')}
          </p> */}
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/30">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('permissions.audit.search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm border-white/30"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/90 backdrop-blur-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filters')}
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <Select value={filters.checkResult || 'all'} onValueChange={(value) => handleFilterChange('checkResult', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder={t('permissions.audit.filters.result')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value={CheckResult.GRANTED}>{t('permissions.results.granted')}</SelectItem>
                    <SelectItem value={CheckResult.DENIED}>{t('permissions.results.denied')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.action || 'all'} onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder={t('permissions.audit.filters.action')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {Object.values(PermissionAction).map(action => (
                      <SelectItem key={action} value={action}>
                        {t(`permissions.actions.${action}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DatePicker
                  placeholder={t('permissions.audit.filters.dateFrom')}
                  value={filters.dateFrom || ''}
                  onChange={(value) => handleFilterChange('dateFrom', value)}
                  className="bg-white/90 backdrop-blur-sm border-white/30"
                />

                <DatePicker
                  placeholder={t('permissions.audit.filters.dateTo')}
                  value={filters.dateTo || ''}
                  onChange={(value) => handleFilterChange('dateTo', value)}
                  className="bg-white/90 backdrop-blur-sm border-white/30"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredChecks.length === 0 ? (
        <Card className="bg-white/95 backdrop-blur-sm border-white/30">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('permissions.audit.noResults')}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? t('permissions.audit.noSearchResults')
                : t('permissions.audit.noData')
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChecks.map((check) => (
            <Card key={check.id} className="bg-white/95 backdrop-blur-sm border-white/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {getResultIcon(check.checkResult)}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {check.user.fullName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {check.user.email}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>{check.resource}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span>{t(`permissions.actions.${check.action}`)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatLocalizedDateTime(check.checkedAt)}</span>
                      </div>
                    </div>

                    {check.reason && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>{t('permissions.audit.reason')}:</strong> {check.reason}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{t('permissions.audit.ipAddress')}: {check.ipAddress}</span>
                      {check.resourceContext && (
                        <span>{t('permissions.audit.context')}: {check.resourceContext}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getResultBadge(check.checkResult)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-white/30">
          <div className="text-sm text-gray-600">
            {t('common.pagination.showing', {
              start: (pagination.page - 1) * pagination.limit + 1,
              end: Math.min(pagination.page * pagination.limit, pagination.total),
              total: pagination.total,
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="bg-white/90 backdrop-blur-sm"
            >
              {t('common.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="bg-white/90 backdrop-blur-sm"
            >
              {t('common.pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

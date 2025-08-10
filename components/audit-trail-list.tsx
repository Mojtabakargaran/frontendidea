'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  User, 
  Shield, 
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  FileSpreadsheet,
  File
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate } from '@/lib/locale-formatting';
import { auditService } from '@/services/api';
import { downloadFile, createExportFilename } from '@/lib/download-utils';
import type { 
  AuditLogsResponse, 
  AuditLogsParams, 
  AuditLog, 
  AuditAction, 
  AuditStatus,
  TenantLocale,
  TenantLanguage,
  ExportFormat,
  AuditExportRequest,
  ApiError 
} from '@/types';

interface AuditDetailDialogProps {
  auditLog: AuditLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AuditDetailDialog({ auditLog, open, onOpenChange }: AuditDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const { config } = useGlobalLocaleFormatting();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('audit.detail.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {t('audit.detail.timestamp')}
              </Label>
              <p className="text-sm font-mono bg-gray-50 rounded p-2">
                {formatLocalizedDate(auditLog.createdAt)}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {t('audit.detail.action')}
              </Label>
              <p className="text-sm">
                <Badge variant={auditLog.status === 'success' ? 'default' : 'destructive'}>
                  {auditLog.actionType}
                </Badge>
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {t('audit.detail.actor')}
              </Label>
              <p className="text-sm">
                {auditLog.actor.fullName} ({auditLog.actor.email})
              </p>
            </div>
            
            {auditLog.target && (
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  {t('audit.detail.target')}
                </Label>
                <p className="text-sm">
                  {auditLog.target.fullName} ({auditLog.target.email})
                </p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {t('audit.detail.ipAddress')}
              </Label>
              <p className="text-sm font-mono bg-gray-50 rounded p-2">
                {auditLog.ipAddress}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {t('audit.detail.status')}
              </Label>
              <p className="text-sm">
                <Badge variant={auditLog.status === 'success' ? 'default' : 'destructive'}>
                  {auditLog.status === 'success' ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {t(`audit.status.${auditLog.status}`)}
                </Badge>
              </p>
            </div>
          </div>
          
          <hr className="border-gray-200 my-4" />
          
          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-600">
              {t('audit.detail.description')}
            </Label>
            <p className="text-sm bg-gray-50 rounded p-3 mt-1">
              {auditLog.description}
            </p>
          </div>
          
          {/* User Agent */}
          <div>
            <Label className="text-sm font-medium text-gray-600">
              {t('audit.detail.userAgent')}
            </Label>
            <p className="text-xs font-mono bg-gray-50 rounded p-3 mt-1 break-all">
              {auditLog.userAgent}
            </p>
          </div>
          
          {/* Metadata */}
          {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-600">
                {t('audit.detail.metadata')}
              </Label>
              <pre className="text-xs bg-gray-50 rounded p-3 mt-1 overflow-x-auto">
                {JSON.stringify(auditLog.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditTrailList() {
  const { t, i18n } = useTranslation();
  const { config } = useGlobalLocaleFormatting();
  
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
  
  // State for filters and pagination
  const [params, setParams] = useState<AuditLogsParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  
  // UI states
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv' as ExportFormat);
  
  // Query for audit logs
  const {
    data: auditLogsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<AuditLogsResponse, ApiError>({
    queryKey: ['audit-logs', params],
    queryFn: () => {
      // Validate params before making API call
      const validatedParams = {
        ...params,
        page: isNaN(params.page || 0) || (params.page || 0) < 1 ? 1 : params.page!,
        limit: isNaN(params.limit || 0) || (params.limit || 0) < 1 ? 20 : params.limit!,
      };
      
      return auditService.getLogs(validatedParams);
    },
    enabled: typeof window !== 'undefined',
  });

  const handleSearch = () => {
    const newParams: AuditLogsParams = {
      ...params,
      page: 1, // Reset to first page
    };
    
    if (searchTerm) {
      newParams.userId = searchTerm;
    } else {
      delete newParams.userId;
    }
    
    if (selectedAction && selectedAction !== 'all') {
      newParams.action = selectedAction as any; // Backend expects the raw action string
    } else {
      delete newParams.action;
    }
    
    if (selectedStatus && selectedStatus !== 'all') {
      newParams.status = selectedStatus as AuditStatus;
    } else {
      delete newParams.status;
    }
    
    if (dateFrom) {
      newParams.dateFrom = dateFrom;
    } else {
      delete newParams.dateFrom;
    }
    
    if (dateTo) {
      newParams.dateTo = dateTo;
    } else {
      delete newParams.dateTo;
    }
    
    if (ipAddress) {
      newParams.ipAddress = ipAddress;
    } else {
      delete newParams.ipAddress;
    }
    
    setParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedAction('all');
    setSelectedStatus('all');
    setDateFrom('');
    setDateTo('');
    setIpAddress('');
    setParams({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handlePageChange = (newPage: number) => {
    // Validate that newPage is a valid number
    if (isNaN(newPage) || newPage < 1) {
      console.error('Invalid page number:', newPage);
      return;
    }
    
    setParams(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog);
    setIsDetailDialogOpen(true);
  };

  const handleExport = async (format: ExportFormat = exportFormat) => {
    try {
      setIsExporting(true);
      
      // Build export request with current filters - backend expects flat structure
      const exportRequest: AuditExportRequest = {
        exportFormat: format,
        ...(searchTerm && { userId: searchTerm }),
        ...(selectedAction !== 'all' && { action: selectedAction as AuditAction }),
        ...(selectedStatus !== 'all' && { status: selectedStatus as AuditStatus }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(ipAddress && { ipAddress }),
      };

      console.log('Export request:', JSON.stringify(exportRequest, null, 2));
      console.log('Current filters:', { searchTerm, selectedAction, selectedStatus, dateFrom, dateTo, ipAddress });
      
      const response = await auditService.exportLogs(exportRequest);
      console.log('Export response:', response);
      
      if (response.data.downloadUrl) {
        // If download URL is available immediately, trigger automatic download
        try {
          const filename = createExportFilename('audit-export', format);
          console.log(`Starting download: ${filename}`);
          
          // For immediate downloads, the downloadUrl is a relative path like "/audit/download/123"
          // We need to convert it to a full URL
          const fullDownloadUrl = response.data.downloadUrl.startsWith('http') 
            ? response.data.downloadUrl 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}${response.data.downloadUrl}`;
          
          await downloadFile(fullDownloadUrl, { filename, defaultExtension: format });
          
          // Show success notification
          const actualRecords = response.data.estimatedRecordCount || 0;
          let message = t('audit.export.downloadStarted');
          message += `\n${t('audit.export.filename')}: ${filename}`;
          if (actualRecords > 0) {
            message += `\n${t('audit.export.recordsExported')}: ${actualRecords.toLocaleString()}`;
          }
          console.log('Download completed successfully');
          alert(message);
        } catch (downloadError) {
          console.error('Automatic download failed, falling back to manual download:', downloadError);
          
          // Fallback to manual download link if automatic download fails
          const filename = createExportFilename('audit-export', format);
          
          // Create the full URL for manual download
          const fullDownloadUrl = response.data.downloadUrl.startsWith('http') 
            ? response.data.downloadUrl 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}${response.data.downloadUrl}`;
          
          const link = document.createElement('a');
          link.href = fullDownloadUrl;
          link.download = filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          const message = `${t('audit.export.downloadStarted')}\n${t('audit.export.filename')}: ${filename}`;
          alert(message);
        }
      } else {
        // Show detailed success message for async export
        const estimatedRecords = response.data.estimatedRecordCount || response.data.estimatedRecords || 0;
        const expiresAt = response.data.expiresAt;
        const exportId = response.data.exportId;
        
        let message = `${t('audit.export.initiated')}\n`;
        
        if (exportId) {
          message += `${t('audit.export.exportId')}: ${exportId}\n`;
        }
        
        if (estimatedRecords > 0) {
          message += `${t('audit.export.estimatedRecords')}: ${estimatedRecords.toLocaleString()}\n`;
        }
        
        if (expiresAt) {
          const expireDate = new Date(expiresAt).toLocaleDateString();
          message += `${t('audit.export.expiresAt')}: ${expireDate}\n`;
        }
        
        message += `\n${t('audit.export.checkBackLater')}`;
        
        console.log('Async export initiated:', { exportId, estimatedRecords, expiresAt });
        alert(message);
        
        // TODO: Implement export status polling and automatic download when ready
        // This would involve periodic checks to the backend for export completion
        console.log('Export queued for async processing. Consider implementing polling mechanism.');
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show more specific error message
      let errorMessage = t('audit.export.error');
      
      if (error.response?.data?.message) {
        errorMessage += `\n${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `\n${error.message}`;
      }
      
      if (error.response?.status) {
        errorMessage += `\n${t('audit.export.errorCode')}: ${error.response.status}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login') || actionLower.includes('logout')) {
      return <User className="w-4 h-4" />;
    }
    if (actionLower.includes('user') || actionLower.includes('کاربر') || actionLower.includes('مستخدم')) {
      return <User className="w-4 h-4" />;
    }
    return <Activity className="w-4 h-4" />;
  };

  const getActionBadgeVariant = (action: string, status: AuditStatus) => {
    if (status === 'failed') return 'destructive';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('delete') || actionLower.includes('lock') || 
        actionLower.includes('حذف') || actionLower.includes('قفل') ||
        actionLower.includes('حذف') || actionLower.includes('قفل')) return 'destructive';
    if (actionLower.includes('create') || actionLower.includes('success') ||
        actionLower.includes('ایجاد') || actionLower.includes('موفق') ||
        actionLower.includes('إنشاء') || actionLower.includes('ناجح')) return 'default';
    return 'secondary';
  };

  // Process data and memoize before any early returns
  const auditLogs = React.useMemo(() => 
    auditLogsData?.data.auditLogs || [], 
    [auditLogsData?.data.auditLogs]
  );
  
  const pagination = auditLogsData?.data.pagination;

  // Get all available action types for the filter dropdown (static list to ensure all actions are always available)
  const availableActionTypes = React.useMemo(() => {
    const allActions = [
      // User Management Actions
      'user_created',
      'user_updated', 
      'user_deleted',
      'user_locked',
      'user_unlocked',
      'user_deactivated',
      'user_activated',
      'role_assigned',
      'role_removed',
      'user_role_changed',
      // Authentication Actions
      'login_success',
      'login_failed',
      'logout',
      'session_terminated',
      // Password Actions
      'password_reset_initiated',
      'password_reset_requested',
      'password_reset_completed',
      'password_changed',
      // Profile Actions
      'profile_updated',
      'email_verified',
      // Audit Actions
      'audit_logs_viewed',
      'audit_export_initiated',
      // System Actions
      'system_configuration_changed'
    ];

    return allActions.map(action => {
      // Try to get translation from existing audit logs first, then fallback to generic translation
      const existingLog = auditLogs.find(log => log.rawActionType === action);
      let translatedAction: string;
      
      if (existingLog?.actionType) {
        translatedAction = existingLog.actionType;
      } else {
        // Try to get translation, fallback to a readable format if not found
        const translationKey = `audit.actions.${action}`;
        const translationResult = t(translationKey);
        
        if (translationResult === translationKey) {
          // Translation not found, create a readable fallback
          translatedAction = action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
          translatedAction = translationResult;
        }
      }
      
      return [action, translatedAction] as [string, string];
    }).sort((a, b) => a[1].localeCompare(b[1]));
  }, [auditLogs, t]);

  if (isLoading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span>{t('audit.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('audit.error.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || t('audit.error.general')}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('audit.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {t('audit.filters.title')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {isFiltersOpen ? t('audit.filters.hide') : t('audit.filters.show')}
            </Button>
          </div>
        </CardHeader>
        
        {isFiltersOpen && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search by User */}
              <div>
                <Label htmlFor="search-user">{t('audit.filters.searchUser')}</Label>
                <Input
                  id="search-user"
                  type="text"
                  placeholder={t('audit.filters.searchUserPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              {/* Action Type */}
              <div>
                <Label>{t('audit.filters.actionType')}</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('audit.filters.allActions')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('audit.filters.allActions')}</SelectItem>
                    {availableActionTypes.map(([rawActionType, translatedActionType]) => (
                      <SelectItem key={rawActionType} value={rawActionType}>
                        {translatedActionType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status */}
              <div>
                <Label>{t('audit.filters.status')}</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('audit.filters.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('audit.filters.allStatuses')}</SelectItem>
                    <SelectItem value="success">{t('audit.status.success')}</SelectItem>
                    <SelectItem value="failed">{t('audit.status.failed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date From */}
              <div>
                <Label htmlFor="date-from">{t('audit.filters.dateFrom')}</Label>
                <DatePicker
                  id="date-from"
                  value={dateFrom}
                  onChange={(value) => setDateFrom(value)}
                  className="mt-1"
                />
              </div>
              
              {/* Date To */}
              <div>
                <Label htmlFor="date-to">{t('audit.filters.dateTo')}</Label>
                <DatePicker
                  id="date-to"
                  value={dateTo}
                  onChange={(value) => setDateTo(value)}
                  className="mt-1"
                />
              </div>
              
              {/* IP Address */}
                <div>
                <Label htmlFor="ip-address">{t('audit.filters.ipAddress')}</Label>
                <Input
                  id="ip-address"
                  type="text"
                  placeholder="192.168.1.1"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="mt-1"
                  dir="ltr"
                  style={{ textAlign: 'left' }}
                />
                </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                {t('audit.filters.search')}
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-2" />
                {t('audit.filters.clear')}
              </Button>
              
              {/* Export Controls */}
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        CSV
                      </div>
                    </SelectItem>
                    {/* <SelectItem value="excel">
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </div>
                    </SelectItem> */}
                    {/* <SelectItem value="pdf">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                      </div>
                    </SelectItem> */}
                    <SelectItem value="json">
                      <div className="flex items-center">
                        <File className="w-4 h-4 mr-2" />
                        JSON
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => handleExport(exportFormat)} disabled={isExporting}>
                  {isExporting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {isExporting ? t('audit.export.exporting') : t('audit.export.button')}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {t('audit.logs.title')} 
              {pagination && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.total} {t('audit.logs.totalRecords')})
                </span>
              )}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('audit.refresh')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('audit.noData')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        {t('audit.table.timestamp')}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        {t('audit.table.actor')}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        {t('audit.table.action')}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        {t('audit.table.target')}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        {t('audit.table.status')}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        {t('audit.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-center">
                          {formatLocalizedDate(log.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div>
                            <div className="font-medium">{log.actor.fullName}</div>
                            <div className="text-gray-500 text-xs">{log.actor.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div className="flex justify-center">
                            <Badge variant={getActionBadgeVariant(log.rawActionType || log.actionType, log.status)}>
                              {getActionIcon(log.rawActionType || log.actionType)}
                              <span className="mr-1 rtl:mr-0 rtl:ml-1">
                                {log.actionType}
                              </span>
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          {log.target ? (
                            <div>
                              <div className="font-medium">{log.target.fullName}</div>
                              <div className="text-gray-500 text-xs">{log.target.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div className="flex justify-center">
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status === 'success' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {t(`audit.status.${log.status}`)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(log)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t('audit.table.viewDetails')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {auditLogs.map((log) => (
                  <Card key={log.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionBadgeVariant(log.rawActionType || log.actionType, log.status)}>
                            {getActionIcon(log.rawActionType || log.actionType)}
                            <span className="mr-1 rtl:mr-0 rtl:ml-1">
                              {log.actionType}
                            </span>
                          </Badge>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {t(`audit.status.${log.status}`)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">{t('audit.table.actor')}: </span>
                          {log.actor.fullName}
                        </div>
                        {log.target && (
                          <div>
                            <span className="font-medium">{t('audit.table.target')}: </span>
                            {log.target.fullName}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{t('audit.table.timestamp')}: </span>
                          {formatLocalizedDate(log.createdAt)}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t('audit.table.viewDetails')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    {t('pagination.showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('pagination.of')} {pagination.total}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('pagination.previous')}
                    </Button>
                    
                    <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      {t('pagination.next')}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Detail Dialog */}
      {selectedAuditLog && (
        <AuditDetailDialog
          auditLog={selectedAuditLog}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}
    </div>
  );
}

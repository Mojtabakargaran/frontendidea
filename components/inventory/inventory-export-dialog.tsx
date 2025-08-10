'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  Settings,
  CheckCircle,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { inventoryService } from '@/services/api';
import { useDirection } from '@/hooks/use-direction';
import type { 
  InventoryItem,
  InventoryExportRequest,
  InventoryExportResponse,
  ExportFormat,
  ExportType
} from '@/types';

// Validation schema for export form
const exportSchema = z.object({
  exportFormat: z.enum(['csv', 'json']), // Temporarily hiding PDF and Excel
  includeDescription: z.boolean().default(true),
  includeAuditHistory: z.boolean().default(false),
  includeStatusInfo: z.boolean().default(true),
  dateRangeEnabled: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine((data) => {
  if (data.dateRangeEnabled) {
    return data.startDate && data.endDate;
  }
  return true;
}, {
  message: 'Start and end dates are required when date range is enabled',
  path: ['dateRangeEnabled'],
});

type ExportFormData = z.infer<typeof exportSchema>;

interface InventoryExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: InventoryItem[];
  exportType: ExportType;
}

export default function InventoryExportDialog({
  isOpen,
  onClose,
  selectedItems,
  exportType
}: InventoryExportDialogProps) {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';

  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      exportFormat: 'json', // Default to JSON since PDF is temporarily hidden
      includeDescription: true,
      includeAuditHistory: false,
      includeStatusInfo: true,
      dateRangeEnabled: false,
    }
  });

  const watchedValues = watch();

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (data: InventoryExportRequest) => inventoryService.exportInventoryItems(data),
    onSuccess: (response: InventoryExportResponse) => {
      if (response.data.downloadUrl) {
        setExportStatus('completed');
        setDownloadUrl(response.data.downloadUrl);
      } else {
        setExportStatus('processing');
        // For large exports, we might need to poll for completion
        // This is a simplified implementation
        setTimeout(() => {
          setExportStatus('completed');
          setDownloadUrl('/api/inventory/export/download/' + response.data.exportId);
        }, 2000);
      }
    },
    onError: (error: any) => {
      setExportStatus('failed');
      setExportError(error.response?.data?.message || t('inventory.export.errors.failed'));
    }
  });

  // Handle form submission
  const onSubmit = (data: ExportFormData) => {
    setExportStatus('processing');
    setExportError(null);

    const exportRequest: InventoryExportRequest = {
      exportFormat: data.exportFormat as any, // Convert to enum value
      exportType: exportType,
      itemIds: selectedItems.map(item => item.id),
      exportOptions: {
        includeDescription: data.includeDescription,
        includeAuditHistory: data.includeAuditHistory,
        includeStatusInfo: data.includeStatusInfo,
        ...(data.dateRangeEnabled && data.startDate && data.endDate && {
          dateRange: {
            startDate: data.startDate,
            endDate: data.endDate
          }
        })
      }
    };

    exportMutation.mutate(exportRequest);
  };

  // Handle download
  const handleDownload = async () => {
    if (downloadUrl) {
      try {
        // Ensure we use the full URL - handle relative URLs properly
        let fullUrl: string;
        if (downloadUrl.startsWith('http')) {
          fullUrl = downloadUrl;
        } else if (downloadUrl.startsWith('/api/')) {
          // downloadUrl already has /api/, so just prepend the base domain
          fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'}${downloadUrl}`;
        } else {
          // downloadUrl doesn't have /api/, so use the full base URL
          fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}${downloadUrl}`;
        }
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          credentials: 'include', // Include cookies for session authentication
          headers: {
            'Accept': '*/*',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        // Get the content as a blob
        const blob = await response.blob();
        
        // Get filename from response headers or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `inventory-export-${new Date().toISOString().split('T')[0]}.${watchedValues.exportFormat}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        onClose();
      } catch (error) {
        console.error('Download failed:', error);
        setExportError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (exportStatus !== 'processing') {
      setExportStatus('idle');
      setDownloadUrl(null);
      setExportError(null);
      onClose();
    }
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4" />;
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />;
      case 'json': return <File className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Download className="w-5 h-5" />
            {t('inventory.export.title')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.export.description', { count: selectedItems.length })}
          </DialogDescription>
        </DialogHeader>

        {exportStatus === 'idle' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Selected Items Summary */}
            <div className="dashboard-card rounded-lg p-4">
              <h3 className="font-medium dashboard-text-primary mb-3">
                {t('inventory.export.selectedItems')}
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="dashboard-text-secondary text-sm">{item.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {t(`inventory.itemType.${item.itemType}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-3">
              <Label className="font-medium dashboard-text-primary">
                {t('inventory.export.format.title')}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(['csv', 'json'] as const).map((format) => (
                  <label key={format} className="cursor-pointer">
                    <input
                      {...register('exportFormat')}
                      type="radio"
                      value={format}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 transition-all ${
                      watchedValues.exportFormat === format
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        {getFormatIcon(format)}
                        <div>
                          <p className="font-medium dashboard-text-primary">
                            {t(`inventory.export.format.${format}.name`)}
                          </p>
                          <p className="text-xs dashboard-text-muted">
                            {t(`inventory.export.format.${format}.description`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <Label className="font-medium dashboard-text-primary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('inventory.export.options.title')}
              </Label>
              
              <div className="space-y-3">
                {/* Include Description */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDescription"
                    checked={watchedValues.includeDescription}
                    onCheckedChange={(checked) => setValue('includeDescription', checked as boolean)}
                  />
                  <Label htmlFor="includeDescription" className="text-sm">
                    {t('inventory.export.options.includeDescription')}
                  </Label>
                </div>

                {/* Include Status Info */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeStatusInfo"
                    checked={watchedValues.includeStatusInfo}
                    onCheckedChange={(checked) => setValue('includeStatusInfo', checked as boolean)}
                  />
                  <Label htmlFor="includeStatusInfo" className="text-sm">
                    {t('inventory.export.options.includeStatusInfo')}
                  </Label>
                </div>

                {/* Include Audit History */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAuditHistory"
                    checked={watchedValues.includeAuditHistory}
                    onCheckedChange={(checked) => setValue('includeAuditHistory', checked as boolean)}
                  />
                  <Label htmlFor="includeAuditHistory" className="text-sm">
                    {t('inventory.export.options.includeAuditHistory')}
                  </Label>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dateRangeEnabled"
                      checked={watchedValues.dateRangeEnabled}
                      onCheckedChange={(checked) => setValue('dateRangeEnabled', checked as boolean)}
                    />
                    <Label htmlFor="dateRangeEnabled" className="text-sm">
                      {t('inventory.export.options.dateRange')}
                    </Label>
                  </div>

                  {watchedValues.dateRangeEnabled && (
                    <div className="grid grid-cols-2 gap-3 ml-6">
                      <div>
                        <Label htmlFor="startDate" className="text-sm">
                          {t('inventory.export.options.startDate')}
                        </Label>
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              id="startDate"
                              value={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-sm">
                          {t('inventory.export.options.endDate')}
                        </Label>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              id="endDate"
                              value={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors.dateRangeEnabled && (
                <p className="text-sm text-red-600">{errors.dateRangeEnabled.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="dashboard-button-primary"
                disabled={!isValid}
              >
                <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('inventory.export.actions.startExport')}
              </Button>
            </div>
          </form>
        )}

        {exportStatus === 'processing' && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <h3 className="text-lg font-medium dashboard-text-primary mt-4 mb-2">
              {t('inventory.export.status.processing')}
            </h3>
            <p className="dashboard-text-muted">
              {t('inventory.export.status.processingDescription')}
            </p>
          </div>
        )}

        {exportStatus === 'completed' && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium dashboard-text-primary mb-2">
              {t('inventory.export.status.completed')}
            </h3>
            <p className="dashboard-text-muted mb-6">
              {t('inventory.export.status.completedDescription')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                {t('common.close')}
              </Button>
              <Button onClick={handleDownload} className="dashboard-button-primary">
                <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('inventory.export.actions.download')}
              </Button>
            </div>
          </div>
        )}

        {exportStatus === 'failed' && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium dashboard-text-primary mb-2">
              {t('inventory.export.status.failed')}
            </h3>
            <Alert className="mb-6">
              <AlertDescription>
                {exportError || t('inventory.export.errors.failed')}
              </AlertDescription>
            </Alert>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                {t('common.close')}
              </Button>
              <Button 
                onClick={() => setExportStatus('idle')}
                className="dashboard-button-primary"
              >
                {t('common.tryAgain')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

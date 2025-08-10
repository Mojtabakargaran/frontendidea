'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDirection } from '@/hooks/use-direction';
import { inventoryService } from '@/services/api';
import type { AvailabilityStatus, InventoryItem } from '@/types';

// Validation schema for status change
const statusChangeSchema = z.object({
  availabilityStatus: z.enum(['available', 'rented', 'maintenance', 'damaged', 'lost']),
  changeReason: z.string().optional(),
  expectedResolutionDate: z.string().optional(),
});

type StatusChangeFormData = z.infer<typeof statusChangeSchema>;

interface ChangeStatusDialogProps {
  item: InventoryItem;
  children: React.ReactNode;
  onStatusChange?: (newStatus: AvailabilityStatus) => void;
}

export default function ChangeStatusDialog({
  item,
  children,
  onStatusChange
}: ChangeStatusDialogProps) {
  const { t } = useTranslation();
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const queryClient = useQueryClient();
  
  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const form = useForm<StatusChangeFormData>({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: {
      availabilityStatus: item.availabilityStatus,
      changeReason: '',
      expectedResolutionDate: '',
    },
  });

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = form;
  const watchedStatus = watch('availabilityStatus');

  // Available status options (simplified based on ?)
  const statusOptions = [
    { value: 'available', label: t('inventory.status.available') },
    { value: 'maintenance', label: t('inventory.status.maintenance') },
    { value: 'damaged', label: t('inventory.status.damaged') },
    { value: 'lost', label: t('inventory.status.lost') },
  ];

  // Check if status requires additional information
  const requiresAdditionalInfo = watchedStatus === 'maintenance' || watchedStatus === 'damaged';

  // Status change mutation
  const changeStatusMutation = useMutation({
    mutationFn: async (data: StatusChangeFormData) => {
      return inventoryService.changeInventoryItemStatus(item.id, {
        newStatus: data.availabilityStatus as AvailabilityStatus,
        changeReason: data.changeReason,
        expectedResolutionDate: data.expectedResolutionDate,
      });
    },
    onSuccess: (response) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['inventory-item', item.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      
      // Call the callback if provided
      onStatusChange?.(response.data.newStatus as AvailabilityStatus);
      
      // Close dialog and reset form
      setOpen(false);
      form.reset({
        availabilityStatus: item.availabilityStatus,
        changeReason: '',
        expectedResolutionDate: '',
      });
      setErrorMessage('');
    },
    onError: (error: any) => {
      console.error('Status change failed:', error);
      
      // Handle specific error codes
      if (error.response?.data?.code === 'INVALID_STATUS_TRANSITION') {
        setErrorMessage(t('inventory.statusChange.errors.invalidTransition'));
      } else if (error.response?.data?.code === 'ITEM_ALLOCATED') {
        setErrorMessage(t('inventory.statusChange.errors.itemAllocated'));
      } else if (error.response?.data?.code === 'FORBIDDEN') {
        setErrorMessage(t('inventory.statusChange.errors.insufficientPermissions'));
      } else {
        setErrorMessage(t('inventory.statusChange.errors.changeFailed'));
      }
    },
  });

  const onSubmit = (data: StatusChangeFormData) => {
    setErrorMessage('');
    changeStatusMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('inventory.statusChange.title')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.statusChange.description', { itemName: item.name })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <Label className="text-sm text-gray-600">
              {t('inventory.statusChange.currentStatus')}
            </Label>
            <p className="font-medium text-gray-900">
              {t(`inventory.status.${item.availabilityStatus}`)}
            </p>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">
              {t('inventory.statusChange.newStatus')}
            </Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue('availabilityStatus', value as AvailabilityStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Change Reason (for maintenance/damaged) */}
          {requiresAdditionalInfo && (
            <div className="space-y-2">
              <Label htmlFor="changeReason">
                {t('inventory.statusChange.changeReason')}
              </Label>
              <Textarea
                id="changeReason"
                {...register('changeReason')}
                placeholder={t('inventory.statusChange.changeReasonPlaceholder')}
                className={`${isRTL ? 'text-right' : 'text-left'}`}
                rows={3}
              />
            </div>
          )}

          {/* Expected Resolution Date (for maintenance/damaged) */}
          {requiresAdditionalInfo && (
            <div className="space-y-2">
              <Label htmlFor="expectedResolutionDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('inventory.statusChange.expectedResolutionDate')}
              </Label>
              <Controller
                name="expectedResolutionDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    id="expectedResolutionDate"
                    value={field.value}
                    onChange={field.onChange}
                    className={`${isRTL ? 'text-right' : 'text-left'}`}
                  />
                )}
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={changeStatusMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit(onSubmit)}
            disabled={changeStatusMutation.isPending}
            className="dashboard-button-primary"
          >
            {changeStatusMutation.isPending ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : null}
            {changeStatusMutation.isPending 
              ? t('inventory.statusChange.actions.changingStatus') 
              : t('inventory.statusChange.actions.changeStatus')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

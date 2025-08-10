'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  UserX, 
  UserCheck, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Users,
  Mail,
  Phone,
  Shield,
  Calendar
} from 'lucide-react';

import { userService } from '@/services/api';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate as formatDateUtil } from '@/lib/locale-formatting';
import type { User, ApiError, ChangeUserStatusResponse, BulkChangeStatusResponse, TenantLocale, TenantLanguage } from '@/types';

interface UserStatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: User | User[]; // Single user or array for bulk operations
  targetStatus: 'active' | 'inactive';
  onSuccess?: (response: ChangeUserStatusResponse | BulkChangeStatusResponse) => void;
}

export default function UserStatusChangeDialog({
  isOpen,
  onClose,
  users,
  targetStatus,
  onSuccess,
}: UserStatusChangeDialogProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { config } = useGlobalLocaleFormatting();
  
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [operationResult, setOperationResult] = useState<ChangeUserStatusResponse | BulkChangeStatusResponse | null>(null);

  // Memoize the date formatting function to re-compute when language changes
  const formatDate = React.useCallback((dateString: string) => {
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
    return formatDateUtil(dateString, languageSpecificConfig);
  }, [config, i18n.language]);

  const isBulkOperation = Array.isArray(users);
  const userArray = Array.isArray(users) ? users : [users];
  const singleUser = Array.isArray(users) ? null : users;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status change mutation
  const statusChangeMutation = useMutation({
    mutationFn: async () => {
      if (isBulkOperation) {
        return userService.bulkChangeStatus({
          userIds: userArray.map(u => u.id),
          status: targetStatus,
          reason: reason.trim() || undefined,
        });
      } else {
        return userService.changeStatus(singleUser!.id, {
          status: targetStatus,
          reason: reason.trim() || undefined,
        });
      }
    },
    onSuccess: (response) => {
      setOperationResult(response);
      setShowConfirmation(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.(response);
    },
    onError: (error: ApiError) => {
      setSubmitError(error.message || t('errors.GENERIC_ERROR'));
      setShowConfirmation(false);
    },
  });

  const handleSubmit = () => {
    setSubmitError('');
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    statusChangeMutation.mutate();
  };

  const handleClose = () => {
    if (!statusChangeMutation.isPending) {
      setReason('');
      setSubmitError('');
      setShowConfirmation(false);
      setOperationResult(null);
      onClose();
    }
  };

  const getActionTitle = () => {
    if (targetStatus === 'active') {
      return isBulkOperation 
        ? t('users.statusChange.bulk.reactivate.title')
        : t('users.statusChange.single.reactivate.title');
    } else {
      return isBulkOperation 
        ? t('users.statusChange.bulk.deactivate.title')
        : t('users.statusChange.single.deactivate.title');
    }
  };

  const getActionDescription = () => {
    if (targetStatus === 'active') {
      return isBulkOperation
        ? t('users.statusChange.bulk.reactivate.description', { count: userArray.length })
        : t('users.statusChange.single.reactivate.description', { name: singleUser?.fullName });
    } else {
      return isBulkOperation
        ? t('users.statusChange.bulk.deactivate.description', { count: userArray.length })
        : t('users.statusChange.single.deactivate.description', { name: singleUser?.fullName });
    }
  };

  const getConfirmationTitle = () => {
    if (targetStatus === 'active') {
      return isBulkOperation
        ? t('users.statusChange.confirmation.bulk.reactivate.title')
        : t('users.statusChange.confirmation.single.reactivate.title');
    } else {
      return isBulkOperation
        ? t('users.statusChange.confirmation.bulk.deactivate.title')
        : t('users.statusChange.confirmation.single.deactivate.title');
    }
  };

  const getConfirmationDescription = () => {
    if (targetStatus === 'active') {
      return isBulkOperation
        ? t('users.statusChange.confirmation.bulk.reactivate.description', { count: userArray.length })
        : t('users.statusChange.confirmation.single.reactivate.description');
    } else {
      return isBulkOperation
        ? t('users.statusChange.confirmation.bulk.deactivate.description', { count: userArray.length })
        : t('users.statusChange.confirmation.single.deactivate.description');
    }
  };

  const getImpactWarning = () => {
    if (targetStatus === 'inactive') {
      return isBulkOperation
        ? t('users.statusChange.impact.bulk.deactivate')
        : t('users.statusChange.impact.single.deactivate');
    } else {
      return isBulkOperation
        ? t('users.statusChange.impact.bulk.reactivate')
        : t('users.statusChange.impact.single.reactivate');
    }
  };

  // Success result display
  if (operationResult) {
    const isSuccess = 'data' in operationResult;
    
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {targetStatus === 'active' 
                    ? t('users.statusChange.success.reactivation.title')
                    : t('users.statusChange.success.deactivation.title')
                  }
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {isBulkOperation
                    ? t('users.statusChange.success.bulk.description', { 
                        count: (operationResult.data as any).affectedUserCount || userArray.length
                      })
                    : t('users.statusChange.success.single.description', { 
                        name: singleUser?.fullName
                      })
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Operation Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    {t('users.statusChange.success.details.newStatus')}:
                  </span>
                  <Badge className={`ml-2 ${getStatusBadgeColor(targetStatus)}`}>
                    {t(`users.status.${targetStatus}`)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    {t('users.statusChange.success.details.timestamp')}:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(operationResult.data.timestamp)}
                  </span>
                </div>
                {isBulkOperation ? (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t('users.statusChange.success.details.affectedUsers')}:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {(operationResult.data as any).affectedUserCount}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t('users.statusChange.success.details.sessionsInvalidated')}:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {(operationResult.data as any).totalSessionsInvalidated}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t('users.statusChange.success.details.previousStatus')}:
                      </span>
                      <Badge className={`ml-2 ${getStatusBadgeColor((operationResult.data as any).previousStatus)}`}>
                        {t(`users.status.${(operationResult.data as any).previousStatus}`)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        {t('users.statusChange.success.details.sessionsInvalidated')}:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {(operationResult.data as any).activeSessionCount}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {reason && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <span className="font-medium text-gray-700">
                    {t('users.statusChange.success.details.reason')}:
                  </span>
                  <p className="mt-1 text-gray-600 text-sm">{reason}</p>
                </div>
              )}
            </div>

            {/* Notification Status */}
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">
                {('emailSent' in operationResult.data ? operationResult.data.emailSent : true)
                  ? t('users.statusChange.success.emailSent')
                  : t('users.statusChange.success.emailFailed')
                }
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              {t('users.statusChange.success.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation dialog
  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={() => setShowConfirmation(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {getConfirmationTitle()}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  {getConfirmationDescription()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getImpactWarning()}
              </AlertDescription>
            </Alert>

            {reason && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <span className="font-medium text-gray-700 text-sm">
                  {t('users.statusChange.confirmation.reason')}:
                </span>
                <p className="mt-1 text-gray-600 text-sm">{reason}</p>
              </div>
            )}
          </div>

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={statusChangeMutation.isPending}
            >
              {t('users.statusChange.confirmation.cancel')}
            </Button>
            <Button
              variant={targetStatus === 'inactive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={statusChangeMutation.isPending}
            >
              {statusChangeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('users.statusChange.confirmation.processing')}
                </>
              ) : (
                targetStatus === 'active' 
                  ? t('users.statusChange.confirmation.reactivate')
                  : t('users.statusChange.confirmation.deactivate')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main dialog
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {targetStatus === 'active' ? (
              <UserCheck className="h-6 w-6 text-green-500" />
            ) : (
              <UserX className="h-6 w-6 text-red-500" />
            )}
            <div>
              <DialogTitle className="text-lg font-semibold">
                {getActionTitle()}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {getActionDescription()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          {!isBulkOperation && singleUser && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="bg-white rounded-full p-2 border border-gray-300">
                  <Shield className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{singleUser.fullName}</h4>
                    <Badge className={getStatusBadgeColor(singleUser.status)}>
                      {t(`users.status.${singleUser.status}`)}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{singleUser.email}</span>
                    </div>
                    {singleUser.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{singleUser.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{t(`common.roles.${singleUser.roleName}`)}</span>
                    </div>
                    {singleUser.lastLoginAt && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t('users.list.lastLogin')}: {formatDate(singleUser.lastLoginAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk operation summary */}
          {isBulkOperation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    {t('users.statusChange.bulk.summary.title')}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {t('users.statusChange.bulk.summary.description', { 
                      count: userArray.length,
                      action: targetStatus === 'active' 
                        ? t('users.statusChange.bulk.summary.reactivated')
                        : t('users.statusChange.bulk.summary.deactivated')
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Impact Warning */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {getImpactWarning()}
            </AlertDescription>
          </Alert>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              {t('users.statusChange.reason.label')}
              <span className="text-gray-500 font-normal ml-1">
                ({t('users.statusChange.reason.optional')})
              </span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder={t('users.statusChange.reason.placeholder')}
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('users.statusChange.reason.help')}</span>
              <span>{reason.length}/500</span>
            </div>
          </div>

          {/* Error Display */}
          {submitError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={handleClose}>
            {t('users.statusChange.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant={targetStatus === 'inactive' ? 'destructive' : 'default'}
          >
            {targetStatus === 'active' 
              ? t('users.statusChange.reactivate')
              : t('users.statusChange.deactivate')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

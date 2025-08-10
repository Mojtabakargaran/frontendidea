'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle, Copy, Mail, Clock, Key } from 'lucide-react';

import { userService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import type { User, ResetPasswordRequest, ResetPasswordResponse, ResetMethod, ApiError, TenantLocale, TenantLanguage } from '@/types';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate as formatDateUtil } from '@/lib/locale-formatting';

interface ResetPasswordDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResetPasswordDialog({ user, isOpen, onClose }: ResetPasswordDialogProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { config } = useGlobalLocaleFormatting();
  const [selectedMethod, setSelectedMethod] = useState<ResetMethod | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Memoize the date formatting function and locale config for better performance
  const languageSpecificConfig = React.useMemo(() => ({
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
  }), [config, i18n.language]);

  const formatDate = React.useCallback((dateString: string) => {
    try {
      return formatDateUtil(dateString, languageSpecificConfig);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }, [languageSpecificConfig]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      if (!user) throw new Error('No user selected');
      return userService.resetPassword(user.id, data);
    },
    onSuccess: (response) => {
      setResetResult(response);
      setShowConfirmation(false);
      // Invalidate users list to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Password reset error:', error);
    },
  });

  const handleMethodSelect = (method: ResetMethod) => {
    setSelectedMethod(method);
    setShowConfirmation(true);
  };

  const handleConfirmReset = () => {
    if (!selectedMethod) return;
    resetPasswordMutation.mutate({ resetMethod: selectedMethod });
  };

  const handleCopyPassword = async () => {
    if (resetResult?.data.temporaryPassword) {
      try {
        await navigator.clipboard.writeText(resetResult.data.temporaryPassword);
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      } catch (error) {
        console.error('Failed to copy password:', error);
      }
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setShowConfirmation(false);
    setResetResult(null);
    setCopiedPassword(false);
    onClose();
  };

  if (!user) return null;

  // Get API error if exists
  const apiError = resetPasswordMutation.error as ApiError | null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Shield className="h-6 w-6 text-blue-600" />
            {t('users.resetPassword.title')}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('users.resetPassword.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* User Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-800">{t('users.resetPassword.userInfo.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('users.resetPassword.userInfo.name')}:</span>
                <span className="font-medium">{user.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('users.resetPassword.userInfo.email')}:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('users.resetPassword.userInfo.role')}:</span>
                <Badge variant="secondary">{t(`common.roles.${user.roleName}`)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('users.resetPassword.userInfo.lastLogin')}:</span>
                <span className="font-medium">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('users.list.never_logged_in')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Method Selection */}
        {!resetResult && !showConfirmation && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('users.resetPassword.methods.title')}
            </h3>
            
            <div className="grid gap-4">
              {/* Temporary Password Method */}
              <Card 
                className="cursor-pointer hover:bg-blue-50 border-2 hover:border-blue-300 transition-colors duration-150"
                onClick={() => handleMethodSelect('admin_temporary_password')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Key className="h-8 w-8 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t('users.resetPassword.methods.temporaryPassword.title')}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {t('users.resetPassword.methods.temporaryPassword.description')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {t('users.resetPassword.methods.temporaryPassword.features.immediate')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {t('users.resetPassword.methods.temporaryPassword.features.expires24h')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {t('users.resetPassword.methods.temporaryPassword.features.forceChange')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reset Link Method */}
              <Card 
                className="cursor-pointer hover:bg-green-50 border-2 hover:border-green-300 transition-colors duration-150"
                onClick={() => handleMethodSelect('admin_reset_link')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Mail className="h-8 w-8 text-green-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t('users.resetPassword.methods.resetLink.title')}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {t('users.resetPassword.methods.resetLink.description')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {t('users.resetPassword.methods.resetLink.features.secure')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {t('users.resetPassword.methods.resetLink.features.userChoice')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {t('users.resetPassword.methods.resetLink.features.expires24h')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && selectedMethod && (
          <div className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                {selectedMethod === 'admin_temporary_password' 
                  ? t('users.resetPassword.confirmation.temporaryPassword')
                  : t('users.resetPassword.confirmation.resetLink')
                }
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                {t('users.resetPassword.confirmation.consequences.title')}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('users.resetPassword.confirmation.consequences.invalidateSessions')}</li>
                <li>• {t('users.resetPassword.confirmation.consequences.emailNotification')}</li>
                <li>• {t('users.resetPassword.confirmation.consequences.auditLog')}</li>
                {selectedMethod === 'admin_temporary_password' && (
                  <li>• {t('users.resetPassword.confirmation.consequences.temporaryExpiry')}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Success Result */}
        {resetResult && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t('users.resetPassword.success.message')}
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-800">
                {t('users.resetPassword.success.details.title')}
              </h4>
              
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('users.resetPassword.success.details.method')}:</span>
                  <Badge variant="secondary">
                    {resetResult.data.resetMethod === 'admin_temporary_password' 
                      ? t('users.resetPassword.methods.temporaryPassword.title')
                      : t('users.resetPassword.methods.resetLink.title')
                    }
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('users.resetPassword.success.details.expiresAt')}:</span>
                  <span className="font-medium">{formatDate(resetResult.data.expiresAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('users.resetPassword.success.details.emailSent')}:</span>
                  <Badge variant={resetResult.data.emailSent ? "default" : "destructive"}>
                    {resetResult.data.emailSent 
                      ? t('users.resetPassword.success.details.emailSentYes')
                      : t('users.resetPassword.success.details.emailSentNo')
                    }
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('users.resetPassword.success.details.sessionsInvalidated')}:</span>
                  <span className="font-medium">{resetResult.data.sessionsInvalidated}</span>
                </div>
              </div>

              {/* Temporary Password Display */}
              {resetResult.data.temporaryPassword && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">
                      {t('users.resetPassword.success.temporaryPassword.title')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <code className="flex-1 font-mono text-sm break-all">
                      {resetResult.data.temporaryPassword}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPassword}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                      {copiedPassword ? t('users.resetPassword.success.temporaryPassword.copied') : t('users.resetPassword.success.temporaryPassword.copy')}
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    {t('users.resetPassword.success.temporaryPassword.warning')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {apiError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {t(`errors.${apiError.code}`, { defaultValue: apiError.message })}
            </AlertDescription>
          </Alert>
        )}

        {/* Dialog Footer */}
        <DialogFooter className="gap-2">
          {!resetResult && !showConfirmation && (
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="bg-white hover:bg-gray-50"
            >
              {t('users.resetPassword.buttons.cancel')}
            </Button>
          )}
          
          {showConfirmation && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                className="bg-white hover:bg-gray-50"
              >
                {t('users.resetPassword.buttons.back')}
              </Button>
              <Button 
                onClick={handleConfirmReset}
                disabled={resetPasswordMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {t('users.resetPassword.buttons.resetting')}
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {t('users.resetPassword.buttons.confirmReset')}
                  </>
                )}
              </Button>
            </>
          )}
          
          {resetResult && (
            <Button 
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('users.resetPassword.buttons.close')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

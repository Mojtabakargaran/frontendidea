'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  MapPin,
  Edit,
  Lock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDirection } from '@/hooks/use-direction';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { formatDate } from '@/lib/locale-formatting';
import type { UserProfileResponse, TenantLocale, TenantLanguage } from '@/types';

interface ProfileOverviewProps {
  profile: UserProfileResponse['data'];
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export default function ProfileOverview({ 
  profile, 
  onEditProfile, 
  onChangePassword 
}: ProfileOverviewProps) {
  const { t, i18n } = useTranslation();
  const direction = useDirection();
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

  const getStatusColor = (status: string) => {
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

  const getRoleDisplayName = (roleName: string) => {
    const roleKey = `common.roles.${roleName}`;
    return t(roleKey);
  };

  const getStatusDisplayName = (status: string) => {
    const statusKey = `common.status.${status}`;
    return t(statusKey);
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-blue-600" />
              {t('profile.overview.sections.basicInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {t('profile.overview.fields.fullName')}
              </div>
              <div className="font-medium text-gray-900">
                {profile.fullName}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {t('profile.overview.fields.email')}
              </div>
              <div className="font-medium text-gray-900 break-all" dir="ltr">
                {profile.email}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {t('profile.overview.fields.phoneNumber')}
              </div>
              <div className="font-medium text-gray-900" dir="ltr">
                {profile.phoneNumber || (
                  <span className="text-gray-500 italic">
                    {t('profile.overview.fields.noPhoneNumber')}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-green-600" />
              {t('profile.overview.sections.accountInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                {t('profile.overview.fields.role')}
              </div>
              <div className="font-medium text-gray-900">
                {getRoleDisplayName(profile.roleName)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {t('profile.overview.fields.status')}
              </div>
              <Badge className={getStatusColor(profile.status)}>
                {getStatusDisplayName(profile.status)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {t('profile.overview.fields.createdAt')}
              </div>
              <div className="font-medium text-gray-900">
                {formatLocalizedDate(profile.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
              {t('profile.overview.sections.securityInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {t('profile.overview.fields.lastLogin')}
              </div>
              <div className="font-medium text-gray-900">
                {profile.lastLoginAt ? (
                  formatLocalizedDate(profile.lastLoginAt)
                ) : (
                  <span className="text-gray-500 italic">
                    {t('profile.overview.fields.noLastLogin')}
                  </span>
                )}
              </div>
            </div>
            
            {profile.lastLoginIp && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {t('profile.overview.fields.lastLoginIp')}
                </div>
                <div className="font-medium text-gray-900 font-mono">
                  {profile.lastLoginIp}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/logout-button';
import LanguageSelector from '@/components/language-selector';
import { useUser } from '@/hooks/use-user';

interface DashboardHeaderProps {
  companyName: string;
}

export default function DashboardHeader({ 
  companyName
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-white/30 shadow-xl sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Company Name */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {companyName}
            </h1>
          </div>

          {/* Right Side - Language Selector and User Menu */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Selector */}
            <LanguageSelector />

            {/* User Info */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <User className="h-5 w-5 text-gray-600" />
                <div className="flex flex-col items-start rtl:items-end">
                  <span className="text-sm font-medium">{user?.fullName}</span>
                  <span className="text-xs text-gray-500">
                    {user?.roleName ? t(`common.roles.${user.roleName}`) : ''}
                  </span>
                </div>
              </div>
              
              {/* Logout Button */}
              <LogoutButton 
                variant="outline" 
                size="sm" 
                showIcon={true}
                showConfirm={true}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

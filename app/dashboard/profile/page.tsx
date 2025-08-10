'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Edit, 
  Lock, 
  Monitor, 
  Activity,
  ArrowLeft,
  UserCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import { profileService } from '@/services/api';
import ProfileOverview from '@/components/profile-overview';
import ProfileEditForm from '@/components/profile-edit-form';
import ChangePasswordForm from '@/components/change-password-form';
import SessionsManagement from '@/components/sessions-management';
import ActivityLog from '@/components/activity-log';
import type { UserProfileResponse, ApiError } from '@/types';
import '@/i18n';

// Force dynamic rendering to prevent SSR issues with React Query
export const dynamic = 'force-dynamic';

type ProfileView = 'overview' | 'edit' | 'password' | 'sessions' | 'activity';

function ProfileContent() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ProfileView>('overview');
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client side to prevent hydration issues
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: profileData,
    isLoading,
    error,
    refetch
  } = useQuery<UserProfileResponse, ApiError>({
    queryKey: ['user-profile'],
    queryFn: profileService.getProfile,
    // Add these options to prevent SSR issues
    enabled: typeof window !== 'undefined' && isMounted,
    retry: false,
  });

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <DashboardHeader companyName="" />
        <DashboardNavigation />
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="dashboard-card max-w-md w-full">
                <CardContent className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin me-4" />
                  <span className="text-lg dashboard-text-primary">Loading...</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <DashboardHeader companyName="" />

        {/* Navigation */}
        <DashboardNavigation />

        {/* Main Content */}
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="dashboard-card max-w-md w-full">
                <CardContent className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin me-4" />
                  <span className="text-lg dashboard-text-primary">{t('common.loading')}</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <DashboardHeader companyName="" />

        {/* Navigation */}
        <DashboardNavigation />

        {/* Main Content */}
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="dashboard-card max-w-md w-full">
                <CardContent className="p-8">
                  <Alert variant="destructive" className="border-red-300 bg-red-50">
                    <AlertDescription className="dashboard-text-primary">
                      {error.message}
                      <Button
                        onClick={() => refetch()}
                        variant="outline"
                        size="sm"
                        className="ms-4"
                      >
                        {t('common.retry')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <DashboardHeader companyName="" />

        {/* Navigation */}
        <DashboardNavigation />

        {/* Main Content */}
        <main className="lg:mr-64 pt-16">
          <div className="max-w-screen-2xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl rounded-2xl max-w-md w-full">
                <CardContent className="p-8">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription>
                      {t('profile.messages.notFound')}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const profile = profileData.data;

  const navigationItems = [
    {
      id: 'overview' as ProfileView,
      icon: User,
      label: t('profile.navigation.overview'),
      isActive: currentView === 'overview'
    },
    {
      id: 'edit' as ProfileView,
      icon: Edit,
      label: t('profile.navigation.edit'),
      isActive: currentView === 'edit'
    },
    {
      id: 'password' as ProfileView,
      icon: Lock,
      label: t('profile.navigation.password'),
      isActive: currentView === 'password'
    },
    {
      id: 'sessions' as ProfileView,
      icon: Monitor,
      label: t('profile.navigation.sessions'),
      isActive: currentView === 'sessions'
    },
    {
      id: 'activity' as ProfileView,
      icon: Activity,
      label: t('profile.navigation.activity'),
      isActive: currentView === 'activity'
    }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <ProfileOverview
            profile={profile}
            onEditProfile={() => setCurrentView('edit')}
            onChangePassword={() => setCurrentView('password')}
          />
        );
      case 'edit':
        return (
          <ProfileEditForm
            profile={profile}
            onSuccess={() => {
              refetch();
              setCurrentView('overview');
            }}
            onCancel={() => setCurrentView('overview')}
          />
        );
      case 'password':
        return (
          <ChangePasswordForm
            onSuccess={() => setCurrentView('overview')}
            onCancel={() => setCurrentView('overview')}
          />
        );
      case 'sessions':
        return <SessionsManagement />;
      case 'activity':
        return <ActivityLog />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <DashboardHeader companyName="" />

      {/* Navigation */}
      <DashboardNavigation />

      {/* Main Content */}
      <main className="lg:mr-64 pt-16">
        <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <Card className="dashboard-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-md">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {t('profile.navigation.title')}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {t('profile.overview.subtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-xl sticky top-4 rounded-2xl">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="text-center mb-6 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{profile.fullName}</h3>
                    <p className="text-sm text-gray-600 break-all">{profile.email}</p>
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          variant={item.isActive ? "default" : "ghost"}
                          className={`w-full justify-start ${
                            item.isActive
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4 me-2" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>

                  {/* Back to Dashboard */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      variant="outline"
                      className="w-full bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white/95"
                    >
                      <ArrowLeft className="w-4 h-4 me-2" />
                      {t('common.backToDashboard')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderCurrentView()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}

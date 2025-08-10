'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ArrowLeft } from 'lucide-react';

import CreateUserForm from '@/components/create-user-form';
import EditUserForm from '@/components/edit-user-form';
import UsersList from '@/components/users-list';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CreateUserResponse, EditUserResponse, User } from '@/types';
import '@/i18n';

type ViewMode = 'list' | 'create' | 'edit' | 'success' | 'edit-success';

interface SuccessData {
  user: CreateUserResponse['data'];
  generatedPassword?: string;
}

interface EditSuccessData {
  user: EditUserResponse['data'];
}

function UsersContent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [editSuccessData, setEditSuccessData] = useState<EditSuccessData | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCreateUser = () => {
    setViewMode('create');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleCreateUserSuccess = (response: CreateUserResponse) => {
    setSuccessData({
      user: response.data,
      generatedPassword: response.data.generatedPassword,
    });
    setViewMode('success');
    
    // Invalidate users query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleEditUserSuccess = (response: EditUserResponse) => {
    setEditSuccessData({
      user: response.data,
    });
    setViewMode('edit-success');
    
    // Invalidate users query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSuccessData(null);
    setEditSuccessData(null);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <DashboardHeader companyName="" />

      {/* Navigation */}
      <DashboardNavigation />

      {/* Main Content */}
      <main className="lg:mr-64 pt-16">
        <div className="max-w-screen-2xl mx-auto p-6">
          {viewMode === 'list' && (
            <div>
              <UsersList onCreateUser={handleCreateUser} onEditUser={handleEditUser} />
            </div>
          )}

          {viewMode === 'create' && (
            <div className="max-w-2xl mx-auto">
              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="dashboard-text-secondary hover:dashboard-text-primary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('users.create.back_to_list')}
                </Button>
              </div>

              <CreateUserForm
                onSuccess={handleCreateUserSuccess}
                onCancel={handleBackToList}
              />
            </div>
          )}

          {viewMode === 'edit' && selectedUser && (
            <div>
              <EditUserForm
                user={selectedUser}
                onSuccess={handleEditUserSuccess}
                onCancel={handleBackToList}
              />
            </div>
          )}

          {viewMode === 'success' && successData && (
            <div className="max-w-2xl mx-auto">
              <Card className="dashboard-card rounded-2xl shadow-xl">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold dashboard-text-primary mb-2">
                      {t('users.create.success.title')}
                    </h2>
                    <p className="dashboard-text-secondary">
                      {t('users.create.success.message', { 
                        name: successData.user.fullName 
                      })}
                    </p>
                  </div>

                  {/* User Details */}
                  <div className="bg-gray-50 rounded-xl p-4 text-start space-y-3 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium dashboard-text-muted block mb-1">
                          {t('users.create.form.fullName.label')}
                        </span>
                        <p className="dashboard-text-primary">{successData.user.fullName}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium dashboard-text-muted block mb-1">
                          {t('users.create.form.email.label')}
                        </span>
                        <p className="dashboard-text-primary break-all">{successData.user.email}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium dashboard-text-muted block mb-1">
                          {t('users.create.form.role.label')}
                        </span>
                        <p className="dashboard-text-primary">{t(`common.roles.${successData.user.roleName}`)}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-1">
                          {t('users.create.form.status.label')}
                        </span>
                        <p className="text-gray-900">
                          {t(`users.status.${successData.user.status}`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Generated Password */}
                  {successData.generatedPassword && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-yellow-800">
                        <div className="text-center">
                          <p className="font-medium mb-2">
                            {t('users.create.success.generated_password')}
                          </p>
                          <code className="bg-white px-3 py-2 rounded-lg text-lg font-mono border">
                            {successData.generatedPassword}
                          </code>
                          <p className="text-sm mt-2">
                            {t('users.create.success.password_note')}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Welcome Email Status */}
                  {successData.user.welcomeEmailSent && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {t('users.create.success.welcome_email_sent')}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleBackToList}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white font-medium py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    {t('users.create.success.back_to_list')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === 'edit-success' && editSuccessData && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card rounded-3xl shadow-xl">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('users.edit.success.title')}
                    </h2>
                    <p className="text-gray-600">
                      {t('users.edit.success.message', { 
                        name: editSuccessData.user.fullName 
                      })}
                    </p>
                  </div>

                  {/* User Details */}
                  <div className="bg-gray-50 rounded-xl p-4 text-start space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-1">
                          {t('users.edit.form.fullName.label')}
                        </span>
                        <p className="text-gray-900">{editSuccessData.user.fullName}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-1">
                          {t('users.edit.form.email.label')}
                        </span>
                        <p className="text-gray-900 break-all">{editSuccessData.user.email}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-1">
                          {t('users.edit.form.role.label')}
                        </span>
                        <p className="text-gray-900">{t(`common.roles.${editSuccessData.user.roleName}`)}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500 block mb-1">
                          {t('users.edit.form.status.label')}
                        </span>
                        <p className="text-gray-900">
                          {t(`users.status.${editSuccessData.user.status}`)}
                        </p>
                      </div>
                    </div>

                    {/* Modified Fields */}
                    {editSuccessData.user.modifiedFields && editSuccessData.user.modifiedFields.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-500 block mb-2">
                          {t('users.edit.success.modified_fields')}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {editSuccessData.user.modifiedFields.map((field, index) => {
                            // Map backend field names to translation keys
                            const getFieldTranslationKey = (fieldName: string) => {
                              const fieldMapping: Record<string, string> = {
                                'roleId': 'role',
                                'fullName': 'fullName',
                                'email': 'email',
                                'phoneNumber': 'phoneNumber',
                                'status': 'status'
                              };
                              return fieldMapping[fieldName] || fieldName;
                            };

                            const translationField = getFieldTranslationKey(field);
                            return (
                              <span 
                                key={index}
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {t(`users.edit.form.${translationField}.label`)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notification Status */}
                  {editSuccessData.user.notificationSent && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {t('users.edit.success.notification_sent')}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleBackToList}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white font-medium py-3 px-8 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    {t('users.edit.success.back_to_list')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UsersPage() {
  return <UsersContent />;
}

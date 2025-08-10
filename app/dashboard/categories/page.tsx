'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'lucide-react';
import DashboardHeader from '@/components/dashboard-header';
import DashboardNavigation from '@/components/dashboard-navigation';
import CategoriesList from '@/components/categories-list';
import CreateCategoryForm from '@/components/create-category-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <DashboardHeader companyName="" />
      <DashboardNavigation />
      
      <main className="pt-16 lg:mr-64">
        <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <Card className="dashboard-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-md">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {t('categories.title')}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {t('categories.subtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Categories List */}
            <div className="xl:col-span-2">
              <CategoriesList />
            </div>

            {/* Create Category Form */}
            <div className="xl:col-span-1">
              <CreateCategoryForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { LocaleFormattingProvider } from '@/providers/locale-formatting-provider';
import { I18nProvider } from '@/providers/i18n-provider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout
 * Provides locale formatting context to all dashboard pages
 * Ensures consistent formatting data availability across navigation
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <I18nProvider>
      <LocaleFormattingProvider>
        {children}
      </LocaleFormattingProvider>
    </I18nProvider>
  );
}

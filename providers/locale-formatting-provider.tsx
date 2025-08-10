'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localeService } from '@/services/api';
import { LocaleFormattingResponse, ApiError } from '@/types';
import { defaultLocaleConfig } from '@/lib/locale-formatting';

interface LocaleFormattingContextType {
  config: LocaleFormattingResponse['data'];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
}

const LocaleFormattingContext = createContext<LocaleFormattingContextType | null>(null);

interface LocaleFormattingProviderProps {
  children: React.ReactNode;
}

/**
 * Locale Formatting Provider
 * Provides locale formatting configuration globally across the application
 * Ensures consistent formatting data availability on all dashboard pages
 */
export function LocaleFormattingProvider({ children }: LocaleFormattingProviderProps) {
  const {
    data: localeData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<LocaleFormattingResponse, ApiError>({
    queryKey: ['locale-formatting'],
    queryFn: localeService.getFormattingConfig,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.code === 'auth.SESSION_EXPIRED' || error.code === 'auth.UNAUTHORIZED') {
        return false;
      }
      return failureCount < 2;
    },
    // Ensure this query runs on mount and stays fresh
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Return the locale configuration, fallback to default if not available
  const config = localeData?.data || defaultLocaleConfig;

  const contextValue: LocaleFormattingContextType = {
    config,
    isLoading,
    isError,
    error: error || null,
    refetch
  };

  return (
    <LocaleFormattingContext.Provider value={contextValue}>
      {children}
    </LocaleFormattingContext.Provider>
  );
}

/**
 * Hook to access locale formatting configuration
 * This replaces the individual useLocaleFormatting hook with a context-based approach
 */
export function useGlobalLocaleFormatting(): LocaleFormattingContextType {
  const context = useContext(LocaleFormattingContext);
  
  if (!context) {
    throw new Error('useGlobalLocaleFormatting must be used within a LocaleFormattingProvider');
  }
  
  return context;
}

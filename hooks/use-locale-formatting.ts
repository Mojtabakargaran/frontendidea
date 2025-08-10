'use client';

import { useQuery } from '@tanstack/react-query';
import { localeService } from '@/services/api';
import { LocaleFormattingResponse, ApiError } from '@/types';
import { defaultLocaleConfig } from '@/lib/locale-formatting';

/**
 * Hook to get locale formatting configuration
 */
export const useLocaleFormatting = () => {
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
  });

  // Return the locale configuration, fallback to default if not available
  const config = localeData?.data || defaultLocaleConfig;

  return {
    config,
    isLoading,
    isError,
    error,
    refetch
  };
};

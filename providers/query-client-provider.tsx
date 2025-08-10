'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a shared QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

interface SharedQueryClientProviderProps {
  children: React.ReactNode;
}

/**
 * Shared QueryClient Provider
 * Provides a single QueryClient instance to the entire application
 * This ensures data consistency across all pages and components
 */
export function SharedQueryClientProvider({ children }: SharedQueryClientProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

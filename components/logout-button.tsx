'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { authService } from '@/services/api';
import type { ApiError } from '@/types';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showConfirm?: boolean;
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

export default function LogoutButton({
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  showConfirm = true,
  onSuccess,
  onError,
}: LogoutButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: (data) => {
      onSuccess?.();
      router.push('/login');
    },
    onError: (error: ApiError) => {
      onError?.(error);
      // Even if logout fails, redirect to login
      router.push('/login');
    },
  });

  const handleLogout = () => {
    if (showConfirm && !confirm(t('auth.logout.confirm'))) {
      return;
    }
    logoutMutation.mutate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
    >
      {logoutMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t('common.loading')}
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          خروج
        </>
      )}
    </Button>
  );
}

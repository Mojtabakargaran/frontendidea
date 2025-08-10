'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/api';
import type { 
  PermissionCheckRequest, 
  PermissionAuditParams,
  UpdateRolePermissionsRequest,
} from '@/types';
import { PermissionAction } from '@/types';
import { useUser } from './use-user';
import { hasResourceAction, canManagePermissions, canViewAudit } from '@/lib/role-utils';
import { hasDynamicPermission, hasAnyResourcePermission, getDynamicAllowedActions } from '@/lib/dynamic-permission-utils';

/**
 * ? - Permission checking and management hooks
 */

/**
 * Hook to get all available system permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get permissions for a specific role
 */
export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: () => permissionService.getRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to update role permissions
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRolePermissionsRequest }) =>
      permissionService.updateRolePermissions(roleId, data),
    onSuccess: (_, { roleId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rolePermissions', roleId] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
}

/**
 * Hook to check specific permission
 */
export function usePermissionCheck() {
  return useMutation({
    mutationFn: (data: PermissionCheckRequest) =>
      permissionService.checkPermission(data),
  });
}

/**
 * Hook to get permission audit logs
 */
export function usePermissionAudit(params?: PermissionAuditParams) {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ['permissionAudit', params],
    queryFn: () => permissionService.getPermissionAudit(params),
    enabled: !!user && canViewAudit(user.roleName),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for client-side permission checking using dynamic permissions from login response
 */
export function useClientPermissions() {
  const { user } = useUser();

  const hasPermission = (resource: string, action: PermissionAction): boolean => {
    if (!user) return false;
    // Use dynamic permissions from login response instead of hardcoded role-based logic
    return hasDynamicPermission(user.permissions || [], resource, action);
  };

  const canManage = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.MANAGE);
  };

  const canRead = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.READ);
  };

  const canCreate = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.CREATE);
  };

  const canUpdate = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.UPDATE);
  };

  const canDelete = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.DELETE);
  };

  const canExport = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.EXPORT);
  };

  const canImport = (resource: string): boolean => {
    if (!user) return false;
    return hasDynamicPermission(user.permissions || [], resource, PermissionAction.IMPORT);
  };

  return {
    user,
    hasPermission,
    canManage,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    canImport,
    // Use dynamic permissions for these as well
    canManagePermissions: user ? hasDynamicPermission(user.permissions || [], 'permissions', PermissionAction.MANAGE) : false,
    canViewAudit: user ? hasDynamicPermission(user.permissions || [], 'audit', PermissionAction.READ) : false,
  };
}

/**
 * HOC for protecting components based on permissions
 */
export function withPermissions<T extends object>(
  Component: React.ComponentType<T>,
  resource: string,
  action: PermissionAction,
  fallback?: React.ComponentType<T>
) {
  return function PermissionProtectedComponent(props: T) {
    const { hasPermission } = useClientPermissions();
    
    if (!hasPermission(resource, action)) {
      if (fallback) {
        const FallbackComponent = fallback;
        return React.createElement(FallbackComponent, props);
      }
      return null;
    }
    
    return React.createElement(Component, props);
  };
}

/**
 * Custom hook for protecting routes based on permissions
 */
export function usePermissionGuard(resource: string, action: PermissionAction) {
  const { hasPermission } = useClientPermissions();
  
  return {
    hasPermission: hasPermission(resource, action),
    canAccess: hasPermission(resource, action),
  };
}

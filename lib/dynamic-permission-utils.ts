/**
 * Dynamic permission utilities that use the actual permissions from login response
 * This replaces hardcoded role-based permissions with server-provided dynamic permissions
 */

import { PermissionAction } from '@/types';

/**
 * Check if user has specific permission based on dynamic permissions array
 */
export const hasDynamicPermission = (
  userPermissions: string[], 
  resource: string, 
  action: PermissionAction
): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  const permissionName = `${resource}:${action}`;
  return userPermissions.includes(permissionName);
};

/**
 * Check if user has any permission for a resource
 */
export const hasAnyResourcePermission = (
  userPermissions: string[], 
  resource: string
): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  return userPermissions.some(permission => permission.startsWith(`${resource}:`));
};

/**
 * Get all allowed actions for a resource based on dynamic permissions
 */
export const getDynamicAllowedActions = (
  userPermissions: string[], 
  resource: string
): PermissionAction[] => {
  if (!userPermissions || userPermissions.length === 0) return [];
  
  const resourcePermissions = userPermissions
    .filter(permission => permission.startsWith(`${resource}:`))
    .map(permission => permission.split(':')[1] as PermissionAction);
    
  return resourcePermissions;
};

/**
 * Check if user can access a navigation item based on dynamic permissions
 */
export const canAccessNavigationItem = (
  userPermissions: string[], 
  itemId: string
): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  
  // Map navigation items to their required permissions
  const navigationPermissionMap: Record<string, string[]> = {
    'dashboard': ['dashboard:read'],
    'users': ['users:read', 'users:create', 'users:update', 'users:delete', 'users:manage'],
    'audit': ['audit:read'],
    'permissions': ['permissions:read', 'permissions:manage'],
    'categories': ['categories:read', 'categories:create', 'categories:update', 'categories:delete', 'categories:manage'],
    'inventory': ['inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete'],
    'customers': ['customers:read', 'customers:create', 'customers:update', 'customers:delete'],
    'rentals': ['rentals:read', 'rentals:create', 'rentals:update', 'rentals:delete'],
    'reports': ['reports:read'],
    'settings': ['settings:read', 'settings:update', 'system:read', 'system:update'],
    'profile': [], // Everyone can access profile
  };
  
  const requiredPermissions = navigationPermissionMap[itemId];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return itemId === 'profile'; // Only profile is accessible without specific permissions
  }
  
  // Check if user has any of the required permissions
  return requiredPermissions.some(requiredPermission => 
    userPermissions.includes(requiredPermission)
  );
};

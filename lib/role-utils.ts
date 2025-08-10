/**
 * Role-based dashboard navigation utilities
 * Implements ? role-based access control and ? permission enforcement
 * NOTE: This file contains LEGACY hardcoded role permissions for backward compatibility.
 * The new dynamic permission system uses permissions from login response in dynamic-permission-utils.ts
 */

import { PermissionAction } from '@/types';

export type UserRole = 'tenant_owner' | 'admin' | 'manager' | 'employee' | 'staff';

export interface RolePermissions {
  dashboard: boolean;
  users: boolean;
  audit: boolean;
  inventory: boolean;
  customers: boolean;
  rentals: boolean;
  reports: boolean;
  settings: boolean;
  permissions: boolean; // ? - Permission management
}

/**
 * Define permissions for each role according to ? requirements and ? updates
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  tenant_owner: {
    dashboard: true,
    users: true,
    audit: true,
    inventory: true,
    customers: true,
    rentals: true,
    reports: true,
    settings: true,
    permissions: true, // Can manage all permissions
  },
  admin: {
    dashboard: true,
    users: true,
    audit: true,
    inventory: true,
    customers: true,
    rentals: true,
    reports: true,
    settings: false, // Limited critical settings only
    permissions: false, // Cannot manage permissions
  },
  manager: {
    dashboard: true,
    users: false,
    audit: false,
    inventory: true,
    customers: true,
    rentals: true,
    reports: true,
    settings: false,
    permissions: false,
  },
  employee: {
    dashboard: true,
    users: false,
    audit: false,
    inventory: true,
    customers: true,
    rentals: true,
    reports: false,
    settings: false,
    permissions: false,
  },
  staff: {
    dashboard: true,
    users: false,
    audit: false,
    inventory: false,
    customers: true,
    rentals: true,
    reports: false,
    settings: false,
    permissions: false,
  },
};

/**
 * ? - Resource-level permission checking
 */
export interface ResourcePermissions {
  users: boolean;
  audit: boolean;
  inventory: boolean;
  customers: boolean;
  rentals: boolean;
  reports: boolean;
  settings: boolean;
  permissions: boolean;
}

/**
 * ? - Action-level permission definitions
 */
export const ROLE_RESOURCE_ACTIONS: Record<UserRole, Record<string, PermissionAction[]>> = {
  tenant_owner: {
    users: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
    audit: [PermissionAction.READ, PermissionAction.EXPORT, PermissionAction.MANAGE],
    inventory: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.IMPORT, PermissionAction.EXPORT],
    customers: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.IMPORT, PermissionAction.EXPORT],
    rentals: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE],
    reports: [PermissionAction.READ, PermissionAction.EXPORT, PermissionAction.MANAGE],
    settings: [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.MANAGE],
    permissions: [PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.MANAGE],
  },
  admin: {
    users: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
    audit: [PermissionAction.READ, PermissionAction.EXPORT],
    inventory: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.IMPORT, PermissionAction.EXPORT],
    customers: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.IMPORT, PermissionAction.EXPORT],
    rentals: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE],
    reports: [PermissionAction.READ, PermissionAction.EXPORT],
    settings: [],
    permissions: [],
  },
  manager: {
    users: [],
    audit: [],
    inventory: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
    customers: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
    rentals: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
    reports: [PermissionAction.READ],
    settings: [],
    permissions: [],
  },
  employee: {
    users: [],
    audit: [],
    inventory: [PermissionAction.READ, PermissionAction.UPDATE],
    customers: [PermissionAction.READ, PermissionAction.UPDATE],
    rentals: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE],
    reports: [],
    settings: [],
    permissions: [],
  },
  staff: {
    users: [],
    audit: [],
    inventory: [],
    customers: [PermissionAction.READ],
    rentals: [PermissionAction.READ, PermissionAction.UPDATE],
    reports: [],
    settings: [],
    permissions: [],
  },
};

/**
 * Get role-based dashboard redirect URL according to ? A2
 */
export const getRoleDashboardUrl = (role: UserRole): string => {
  switch (role) {
    case 'tenant_owner':
      return '/dashboard'; // Comprehensive administrative dashboard
    case 'admin':
      return '/dashboard'; // Administrative dashboard with limited critical settings
    case 'manager':
      return '/dashboard'; // Operational management dashboard
    case 'employee':
      return '/dashboard'; // Standard operational dashboard
    case 'staff':
      return '/dashboard'; // Task-focused limited dashboard
    default:
      return '/dashboard';
  }
};

/**
 * Check if user has permission for a specific feature
 */
export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[role]?.[permission] || false;
};

/**
 * ? - Check if user has specific action permission for a resource
 */
export const hasResourceAction = (role: UserRole, resource: string, action: PermissionAction): boolean => {
  const resourceActions = ROLE_RESOURCE_ACTIONS[role]?.[resource] || [];
  return resourceActions.includes(action);
};

/**
 * ? - Get all allowed actions for a resource and role
 */
export const getAllowedActions = (role: UserRole, resource: string): PermissionAction[] => {
  return ROLE_RESOURCE_ACTIONS[role]?.[resource] || [];
};

/**
 * ? - Check if user can manage permissions (tenant_owner and admin)
 */
export const canManagePermissions = (role: UserRole): boolean => {
  return role === 'tenant_owner' || role === 'admin';
};

/**
 * ? - Check if current user can modify permissions for a specific role
 */
export const canModifyRolePermissions = (currentUserRole: UserRole, targetRole: UserRole): boolean => {
  // Only tenant_owner and admin can manage permissions
  if (!canManagePermissions(currentUserRole)) {
    return false;
  }
  
  // Tenant owners can modify any role
  if (currentUserRole === 'tenant_owner') {
    return true;
  }
  
  // Admins cannot modify tenant_owner or other admin roles
  if (currentUserRole === 'admin') {
    return targetRole !== 'tenant_owner' && targetRole !== 'admin';
  }
  
  return false;
};

/**
 * ? - Check if user can view audit logs (tenant_owner and admin only)
 */
export const canViewAudit = (role: UserRole): boolean => {
  return role === 'tenant_owner' || role === 'admin';
};

/**
 * ? - Check hierarchical permission for user management
 */
export const canManageUser = (currentUserRole: UserRole, targetUserRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    staff: 1,
    employee: 2,
    manager: 3,
    admin: 4,
    tenant_owner: 5,
  };

  const currentLevel = roleHierarchy[currentUserRole];
  const targetLevel = roleHierarchy[targetUserRole];

  // Tenant owner can manage all
  if (currentUserRole === 'tenant_owner') return true;
  
  // Admin cannot manage other admins or tenant owners
  if (currentUserRole === 'admin') {
    return targetUserRole !== 'admin' && targetUserRole !== 'tenant_owner';
  }
  
  // Others cannot manage users
  return false;
};

/**
 * Filter navigation items based on user role
 */
export const getNavigationItemsForRole = (role: UserRole, allItems: any[]): any[] => {
  const permissions = ROLE_PERMISSIONS[role];
  
  return allItems.filter(item => {
    switch (item.id) {
      case 'dashboard':
        return permissions.dashboard;
      case 'users':
        return permissions.users;
      case 'audit':
        return permissions.audit;
      case 'permissions':
        return permissions.permissions;
      case 'inventory':
        return permissions.inventory;
      case 'customers':
        return permissions.customers;
      case 'rentals':
        return permissions.rentals;
      case 'reports':
        return permissions.reports;
      case 'settings':
        return permissions.settings;
      case 'profile':
        return true; // Everyone can access their profile
      default:
        return false;
    }
  });
};

/**
 * Get role display name for UI with translation
 */
export const getRoleDisplayName = (role: UserRole, t: (key: string) => string): string => {
  const roleKeys: Record<UserRole, string> = {
    tenant_owner: 'common.roles.tenant_owner',
    admin: 'common.roles.admin',
    manager: 'common.roles.manager',
    employee: 'common.roles.employee',
    staff: 'common.roles.staff',
  };
  
  return t(roleKeys[role] || role);
};

/**
 * Test file to validate dynamic permission system
 * This file demonstrates how the new dynamic permission system works
 */

import { hasDynamicPermission, hasAnyResourcePermission, getDynamicAllowedActions, canAccessNavigationItem } from '../lib/dynamic-permission-utils';
import { PermissionAction } from '../types';

// Test permissions array from your login response
const testPermissions = [
  "users:create",
  "users:read", 
  "users:update",
  "users:delete",
  "users:manage",
  "users:export",
  "users:import",
  "roles:create",
  "roles:read",
  "roles:update", 
  "roles:manage",
  "permissions:read",
  "permissions:manage",
  "tenants:create",
  "tenants:read",
  "tenants:update",
  "tenants:delete",
  "tenants:manage",
  "audit:read",
  "audit:export",
  "dashboard:read",
  "sessions:read",
  "sessions:delete",
  "sessions:manage",
  "profile:read",
  "profile:update",
  "system:read",
  "system:update",
  "system:manage",
  "categories:create",
  "categories:read",
  "categories:update", 
  "categories:delete",
  "categories:manage"
];

// Test functions
console.log('=== Dynamic Permission System Tests ===');

// Test basic permission checking
console.log('1. Basic Permission Checks:');
console.log('Can create users:', hasDynamicPermission(testPermissions, 'users', PermissionAction.CREATE));
console.log('Can read audit:', hasDynamicPermission(testPermissions, 'audit', PermissionAction.READ));
console.log('Can delete categories:', hasDynamicPermission(testPermissions, 'categories', PermissionAction.DELETE));
console.log('Can import inventory (should be false):', hasDynamicPermission(testPermissions, 'inventory', PermissionAction.IMPORT));

// Test resource access
console.log('\n2. Resource Access Checks:');
console.log('Has any users permissions:', hasAnyResourcePermission(testPermissions, 'users'));
console.log('Has any inventory permissions (should be false):', hasAnyResourcePermission(testPermissions, 'inventory'));

// Test allowed actions
console.log('\n3. Allowed Actions:');
console.log('Users allowed actions:', getDynamicAllowedActions(testPermissions, 'users'));
console.log('Categories allowed actions:', getDynamicAllowedActions(testPermissions, 'categories'));
console.log('Inventory allowed actions (should be empty):', getDynamicAllowedActions(testPermissions, 'inventory'));

// Test navigation access
console.log('\n4. Navigation Access:');
console.log('Can access dashboard:', canAccessNavigationItem(testPermissions, 'dashboard'));
console.log('Can access users:', canAccessNavigationItem(testPermissions, 'users'));
console.log('Can access permissions:', canAccessNavigationItem(testPermissions, 'permissions'));
console.log('Can access inventory (should be false):', canAccessNavigationItem(testPermissions, 'inventory'));
console.log('Can access profile (should be true):', canAccessNavigationItem(testPermissions, 'profile'));

export { testPermissions };

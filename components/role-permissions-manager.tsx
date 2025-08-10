'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Shield, Check, X, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { usePermissions, useRolePermissions, useUpdateRolePermissions } from '@/hooks/use-permissions';
import { useClientPermissions } from '@/hooks/use-permissions';
import { useUser } from '@/hooks/use-user';
import { getRoleDisplayName, canModifyRolePermissions, UserRole } from '@/lib/role-utils';
import { hasDynamicPermission } from '@/lib/dynamic-permission-utils';
import { PermissionAction } from '@/types';
import type { Role, UpdateRolePermissionsRequest } from '@/types';

interface RolePermissionsManagerProps {
  role: Role;
  onClose?: () => void;
}

export function RolePermissionsManager({ role, onClose }: RolePermissionsManagerProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { canManagePermissions } = useClientPermissions();
  const [modifiedPermissions, setModifiedPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useRolePermissions(role.id);
  const updateRolePermissions = useUpdateRolePermissions();

  const isLoading = permissionsLoading || rolePermissionsLoading;

  // Check if current user can modify this specific role's permissions using dynamic permissions
  const canModifyThisRole = user ? (
    hasDynamicPermission(user.permissions || [], 'permissions', PermissionAction.MANAGE) ||
    canModifyRolePermissions(user.roleName as UserRole, role.name as UserRole)
  ) : false;

  // Create a lookup for current permissions
  const currentPermissions = React.useMemo(() => {
    const permissions = permissionsData?.data || [];
    const rolePermissions = rolePermissionsData?.data?.permissions || [];
    const lookup: Record<string, boolean> = {};
    rolePermissions.forEach(rp => {
      lookup[rp.permissionId] = rp.isGranted;
    });
    return lookup;
  }, [permissionsData?.data, rolePermissionsData?.data?.permissions]);

  // Group permissions by resource
  const groupedPermissions = React.useMemo(() => {
    const permissions = Array.isArray(permissionsData?.data) ? permissionsData.data : permissionsData?.data?.permissions || [];
    const groups: Record<string, typeof permissions> = {};
    permissions.forEach(permission => {
      if (!groups[permission.resource]) {
        groups[permission.resource] = [];
      }
      groups[permission.resource].push(permission);
    });
    return groups;
  }, [permissionsData?.data]);

  if (!canManagePermissions || !canModifyThisRole) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {!canManagePermissions 
            ? t('permissions.accessDenied')
            : t('permissions.cannotModifyThisRole', { role: getRoleDisplayName(role.name, t) })
          }
        </AlertDescription>
      </Alert>
    );
  }

  const handlePermissionChange = (permissionId: string, isGranted: boolean) => {
    setModifiedPermissions(prev => ({
      ...prev,
      [permissionId]: isGranted,
    }));
    setHasChanges(true);
  };

  const getPermissionStatus = (permissionId: string): boolean => {
    if (permissionId in modifiedPermissions) {
      return modifiedPermissions[permissionId];
    }
    return currentPermissions[permissionId] || false;
  };

  const handleSave = async () => {
    const updateData: UpdateRolePermissionsRequest = {
      permissions: Object.entries(modifiedPermissions).map(([permissionId, isGranted]) => ({
        permissionId,
        isGranted,
      })),
    };

    try {
      await updateRolePermissions.mutateAsync({ roleId: role.id, data: updateData });
      setModifiedPermissions({});
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update role permissions:', error);
    }
  };

  const handleReset = () => {
    setModifiedPermissions({});
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">{t('permissions.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('permissions.roleManagement.title')}
          </h2>
          <p className="text-gray-600">
            {t('permissions.roleManagement.subtitle', { roleName: getRoleDisplayName(role.name, t) })}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {getRoleDisplayName(role.name, t)}
        </Badge>
      </div>

      {/* Permission Groups */}
      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
          <Card key={resource} className="bg-white/95 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t(`permissions.resources.${resource}`)}
                <Badge variant="secondary" className="text-xs">
                  {resourcePermissions.length} {t('permissions.actionsLabel')}
                </Badge>
              </CardTitle>
              <CardDescription>
                {t(`permissions.resourceDescriptions.${resource}`)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcePermissions.map(permission => {
                  const isGranted = getPermissionStatus(permission.id);
                  const isModified = permission.id in modifiedPermissions;
                  
                  return (
                    <div
                      key={permission.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        isModified 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        id={permission.id}
                        checked={isGranted}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {t(`permissions.actions.${permission.action}`)}
                        </label>
                        <p className="text-xs text-gray-500 truncate">
                          {t(`permissions.actionDescriptions.${permission.action}`, { defaultValue: permission.description })}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {isGranted ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-white/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {t('permissions.unsavedChanges')}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={updateRolePermissions.isPending}
              >
                {t('common.reset')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateRolePermissions.isPending || !canModifyThisRole}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {updateRolePermissions.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('permissions.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('permissions.saveChanges')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {updateRolePermissions.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {updateRolePermissions.error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

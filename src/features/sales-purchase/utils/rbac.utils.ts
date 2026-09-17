import { config } from '../../../config/env';
import { isInstituteAdminToken } from '../../../utils/jwt';
import type { RolePermission } from '../types/sales-purchase.types';

export function isCurrentUserInstituteAdmin(): boolean {
  const authToken = config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
  return isInstituteAdminToken(authToken);
}

export function sanitizeRolePermissions(permissions: RolePermission[]): RolePermission[] {
  // Remove duplicate resources and merge actions
  const resourceMap = new Map<string, string[]>();

  permissions.forEach((perm) => {
    const existing = resourceMap.get(perm.resource) || [];
    const merged = [...new Set([...existing, ...perm.actions])];
    resourceMap.set(perm.resource, merged);
  });

  return Array.from(resourceMap.entries()).map(([resource, actions]) => ({
    resource,
    actions,
  }));
}

export function filterGrantablePermissions(
  permissions: RolePermission[],
  myPermissions: RolePermission[],
  isInstituteAdmin: boolean
): RolePermission[] {
  if (isInstituteAdmin) {
    return permissions;
  }

  const myPermissionMap = new Map<string, Set<string>>();
  myPermissions.forEach((perm) => {
    myPermissionMap.set(perm.resource, new Set(perm.actions));
  });

  return permissions.filter((perm) => {
    const myActions = myPermissionMap.get(perm.resource);
    if (!myActions) return false;

    return perm.actions.every((action) => myActions.has(action));
  });
}

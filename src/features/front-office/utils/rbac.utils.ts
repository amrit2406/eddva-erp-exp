import type { RolePermission } from '../types/rbac.types';

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

export function getApiErrorMessage(error: any, defaultMessage: string): string {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
}

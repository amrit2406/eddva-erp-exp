import { useEffect, useState } from 'react';
import { getAdmissionToken, getCachedIsAdmissionInstituteAdmin } from './ssoSession';
import type { RolePermission } from '../types/admission.types';

export function isCurrentUserInstituteAdmin(): boolean {
  return getCachedIsAdmissionInstituteAdmin();
}

// Reactive version: the Admission session token is exchanged
// asynchronously (see ssoSession.ts), so on a cold load the cached admin
// flag may not be known yet. This hook kicks off/reuses that exchange and
// re-renders once it resolves, instead of freezing on a stale "false".
export function useIsInstituteAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(getCachedIsAdmissionInstituteAdmin());

  useEffect(() => {
    let cancelled = false;
    getAdmissionToken()
      .then(() => {
        if (!cancelled) setIsAdmin(getCachedIsAdmissionInstituteAdmin());
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return isAdmin;
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

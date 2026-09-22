import { useEffect, useState } from 'react';
import { getMyPermissions } from '../api/roles.api';
import { getCachedIsAlumniInstituteAdmin } from '../utils/ssoSession';
import type { RolePermission } from '../types/alumni.types';

interface AccessState {
  permissions: RolePermission[];
  isAdmin: boolean;
}

// For operational actions outside RBAC management (e.g. registering an
// alumnus). Institute Admin can do everything here; staff are limited to
// what their Alumni role grants on the resource.
export function useResourceAccess(resource: string) {
  const [state, setState] = useState<AccessState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyPermissions()
      .then((permissions) => {
        if (!cancelled) setState({ permissions, isAdmin: getCachedIsAlumniInstituteAdmin() });
      })
      .catch(() => {
        if (!cancelled) setState({ permissions: [], isAdmin: getCachedIsAlumniInstituteAdmin() });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const can = (action: string): boolean => {
    if (!state) return false;
    if (state.isAdmin) return true;
    return state.permissions.some((p) => p.resource === resource && p.actions.includes(action));
  };

  return { can, ready: state !== null };
}

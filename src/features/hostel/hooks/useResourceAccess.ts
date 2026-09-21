import { useEffect, useState } from 'react';
import { getHostelMyPermissions } from '../api/roles.api';
import { getCachedIsHostelInstituteAdmin } from '../utils/ssoSession';
import type { HostelRolePermissionRule } from '../types/role.types';

interface AccessState {
  permissions: HostelRolePermissionRule[];
  isAdmin: boolean;
}

// Institute Admin can do everything in the UI (the backend stays the source of
// truth and rejects anything it doesn't allow). Staff are limited to the
// actions their Hostel role grants. `can` checks the hook's resource by
// default; pass another resource for actions that belong elsewhere (e.g. an
// allotment action on a resident page).
export function useResourceAccess(resource: string) {
  const [state, setState] = useState<AccessState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHostelMyPermissions()
      .then((permissions) => {
        // The token exchange has completed by now, so the admin flag is cached.
        if (!cancelled) setState({ permissions, isAdmin: getCachedIsHostelInstituteAdmin() });
      })
      .catch(() => {
        if (!cancelled) setState({ permissions: [], isAdmin: getCachedIsHostelInstituteAdmin() });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const can = (action: string, onResource: string = resource): boolean => {
    if (!state) return false;
    if (state.isAdmin) return true;
    return state.permissions.some((p) => p.resource === onResource && p.actions.includes(action));
  };

  return { can, ready: state !== null };
}

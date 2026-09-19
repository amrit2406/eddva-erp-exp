import { useEffect, useState } from 'react';
import { getMyPermissions } from '../api/roles.api';
import { getCachedIsAdmissionInstituteAdmin } from '../utils/ssoSession';
import type { RolePermission } from '../types/admission.types';

interface AccessState {
  permissions: RolePermission[];
  isAdmin: boolean;
}

// The backend gives Institute Admin view-only access to Admission operations;
// writes need an account with an assigned Admission role. Staff are limited to
// the actions their role grants on the resource.
export function useResourceAccess(resource: string) {
  const [state, setState] = useState<AccessState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyPermissions()
      .then((permissions) => {
        // The token exchange has completed by now, so the admin flag is cached.
        if (!cancelled) setState({ permissions, isAdmin: getCachedIsAdmissionInstituteAdmin() });
      })
      .catch(() => {
        if (!cancelled) setState({ permissions: [], isAdmin: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const can = (action: string): boolean => {
    if (!state) return false;
    if (state.isAdmin) return action === 'read';
    return state.permissions.some((p) => p.resource === resource && p.actions.includes(action));
  };

  return { can, isViewOnlyAdmin: !!state?.isAdmin, ready: state !== null };
}

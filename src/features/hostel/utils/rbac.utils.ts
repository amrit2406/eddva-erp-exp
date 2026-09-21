import { useEffect, useState } from 'react';
import { getHostelToken, getCachedIsHostelInstituteAdmin } from './ssoSession';

export function isCurrentUserInstituteAdmin(): boolean {
  return getCachedIsHostelInstituteAdmin();
}

// Reactive version: the Hostel session token is exchanged
// asynchronously (see ssoSession.ts), so on a cold load the cached admin
// flag may not be known yet. This hook kicks off/reuses that exchange and
// re-renders once it resolves, instead of freezing on a stale "false".
export function useIsInstituteAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(getCachedIsHostelInstituteAdmin());

  useEffect(() => {
    let cancelled = false;
    getHostelToken()
      .then(() => {
        if (!cancelled) setIsAdmin(getCachedIsHostelInstituteAdmin());
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

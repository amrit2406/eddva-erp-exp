import { useEffect, useState } from 'react';
import { getSessions } from '../api/admission.api';
import type { AdmissionSession } from '../types/admission.types';

type LoadStatus = 'loading' | 'ready' | 'failed';

// Academic sessions for dropdowns and name lookups. A role without read access
// to sessions ends up as 'failed' and callers fall back to raw ids.
export function useSessionOptions() {
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    getSessions({ limit: 100 })
      .then((result) => {
        if (cancelled) return;
        setSessions(result.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nameOf = (sessionId?: number | null): string | undefined =>
    sessions.find((session) => session.session_id === sessionId)?.name;

  // Admissions normally run against the open cycle, so forms start there.
  const activeId = sessions.find((session) => session.status === 'active')?.session_id;

  return { sessions, status, nameOf, activeId };
}

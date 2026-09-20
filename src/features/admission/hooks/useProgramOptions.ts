import { useEffect, useState } from 'react';
import { getPrograms } from '../api/admission.api';
import type { AdmissionProgram } from '../types/admission.types';

type LoadStatus = 'loading' | 'ready' | 'failed';

// Programs for dropdowns and name lookups. A role without read access to
// programs ends up as 'failed' and callers fall back to raw ids.
export function useProgramOptions() {
  const [programs, setPrograms] = useState<AdmissionProgram[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    getPrograms({ limit: 100 })
      .then((result) => {
        if (cancelled) return;
        setPrograms(result.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nameOf = (programId?: number | null): string | undefined =>
    programs.find((program) => program.program_id === programId)?.name;

  return { programs, status, nameOf };
}

import { useCallback, useEffect, useState } from 'react';
import { getTestRegistrations } from '../api/admission.api';
import { getApiErrorMessage } from '../utils/errors';
import type { TestRegistration } from '../types/admission.types';

// Registrations feed both the registrations panel and the results entry table,
// so the test page loads them once and shares them.
export function useTestRegistrations(testId: number) {
  const [registrations, setRegistrations] = useState<TestRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getTestRegistrations(testId)
      .then((data) => {
        if (cancelled) return;
        setRegistrations(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load registrations'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { registrations, loading, error, reload };
}

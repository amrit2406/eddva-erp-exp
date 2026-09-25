import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

// A titled group of stat cards.
export function StatSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{children}</div>
    </section>
  );
}

interface SummaryDashboardProps<T> {
  title: string;
  subtitle: string;
  load: () => Promise<T>;
  getErrorMessage: (err: unknown, fallback: string) => string;
  children: (data: T) => ReactNode;
}

// Header + refresh + loading/error states around a single summary endpoint.
export default function SummaryDashboard<T>({ title, subtitle, load, getErrorMessage, children }: SummaryDashboardProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getErrorMessage(err, 'Failed to load dashboard'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // load/getErrorMessage are module-level functions; refreshKey drives refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-red-500">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>
              Try again
            </Button>
          </div>
        </Card>
      ) : !data ? (
        <Card>
          <div className="text-center text-slate-500 py-8">Loading...</div>
        </Card>
      ) : (
        <div className="space-y-6">{children(data)}</div>
      )}
    </div>
  );
}

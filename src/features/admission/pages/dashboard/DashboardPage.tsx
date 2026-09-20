import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ReportData from '../../components/reports/ReportData';
import { getDashboardSummary } from '../../api/admission.api';
import { getApiErrorMessage } from '../../utils/errors';

interface SummaryResult {
  key: number;
  data?: unknown;
  error?: string;
  loadedAt: Date;
}

export default function DashboardPage() {
  // Bumping the key both refetches and marks the shown summary as out of date.
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const loading = result?.key !== reloadKey;

  useEffect(() => {
    let cancelled = false;
    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setResult({ key: reloadKey, data, loadedAt: new Date() });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: reloadKey, error: getApiErrorMessage(err, 'Failed to load the dashboard'), loadedAt: new Date() });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admission Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {result && !loading
              ? `Updated ${result.loadedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
              : 'Where admissions stand right now'}
          </p>
        </div>
        <Button variant="secondary" disabled={loading} onClick={() => setReloadKey((key) => key + 1)}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && !result ? (
        <div className="text-center text-slate-500 py-12">Loading...</div>
      ) : result?.error ? (
        <div className="text-center text-red-500 py-12">{result.error}</div>
      ) : (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <ReportData data={result?.data} />
        </div>
      )}
    </div>
  );
}

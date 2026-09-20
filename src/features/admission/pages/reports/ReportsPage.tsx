import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ReportView from '../../components/reports/ReportView';
import { exportReport, getReport } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { extensionForMime, saveBlob } from '../../utils/download';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { REPORTS, isReportKey, type ReportKey } from '../../utils/reports';

interface ReportResult {
  key: string;
  data?: unknown;
  error?: string;
}

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function ReportsPage() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const requested = params.get('report');
  const report: ReportKey = isReportKey(requested) ? requested : 'funnel';
  const { programs, status: programsStatus } = useProgramOptions();
  const { sessions, status: sessionsStatus } = useSessionOptions();
  const [sessionId, setSessionId] = useState<number | ''>('');
  const [programId, setProgramId] = useState<number | ''>('');
  const [result, setResult] = useState<ReportResult | null>(null);
  const [exporting, setExporting] = useState(false);

  // One key per report + filters: while the stored result belongs to a different
  // key the page is loading, so stale numbers never show under a new heading.
  const key = `${report}|${sessionId}|${programId}`;
  const loading = result?.key !== key;
  const current = REPORTS.find((item) => item.key === report)!;

  useEffect(() => {
    let cancelled = false;
    getReport(report, { session_id: sessionId, program_id: programId })
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key, error: getApiErrorMessage(err, 'Failed to load report') });
      });
    return () => {
      cancelled = true;
    };
  }, [key, report, sessionId, programId]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const { blob, filename } = await exportReport(report, { session_id: sessionId, program_id: programId });
      const extension = extensionForMime(blob.type);
      saveBlob(blob, filename ?? `${report}-report${extension ? `.${extension}` : ''}`);
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to export report'));
    } finally {
      setExporting(false);
    }
  };

  const toId = (value: string): number | '' => (value === '' ? '' : Number(value));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">{current.description}</p>
        </div>
        <Button variant="secondary" disabled={exporting} onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="px-6 pt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {REPORTS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={report === item.key}
                onClick={() => setParams({ report: item.key })}
                className={cn(
                  'px-3 pb-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                  report === item.key
                    ? 'border-[#008BE9] text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pb-3">
            {sessionsStatus === 'ready' && (
              <select value={sessionId} onChange={(e) => setSessionId(toId(e.target.value))} className={selectClass}>
                <option value="">All sessions</option>
                {sessions.map((s) => (
                  <option key={s.session_id} value={s.session_id}>{s.name}</option>
                ))}
              </select>
            )}
            {programsStatus === 'ready' && (
              <select value={programId} onChange={(e) => setProgramId(toId(e.target.value))} className={selectClass}>
                <option value="">All programs</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={p.program_id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : result?.error ? (
            <div className="text-center text-red-500 py-8">{result.error}</div>
          ) : (
            <ReportView key={key} report={report} data={result?.data} />
          )}
        </div>
      </Card>
    </div>
  );
}

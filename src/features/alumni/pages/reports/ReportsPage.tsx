import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ReportData from '../../components/reports/ReportData';
import { exportReport, getReport, REPORT_SUGGESTIONS } from '../../api/reports.api';
import { useToast } from '../../../../hooks/useToast';
import { extensionForMime, saveBlob } from '../../utils/download';
import { getApiErrorMessage } from '../../utils/errors';

interface ReportResult {
  key: string;
  data?: unknown;
  error?: string;
}

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function ReportsPage() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const report = params.get('report') || 'summary';
  const [result, setResult] = useState<ReportResult | null>(null);
  const [exporting, setExporting] = useState(false);

  const loading = result?.key !== report;

  useEffect(() => {
    let cancelled = false;
    getReport(report)
      .then((data) => {
        if (!cancelled) setResult({ key: report, data });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: report, error: getApiErrorMessage(err, 'Failed to load report') });
      });
    return () => {
      cancelled = true;
    };
  }, [report]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const { blob, filename } = await exportReport(report);
      const extension = extensionForMime(blob.type);
      saveBlob(blob, filename ?? `${report}-report${extension ? `.${extension}` : ''}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export report'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">
            The available report names aren't documented — try one of the suggestions or type your own.
          </p>
        </div>
        <Button variant="secondary" disabled={exporting} onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="px-6 pt-4 pb-3 border-b border-slate-200">
          <input
            type="text"
            list="alumni-report-suggestions"
            value={report}
            onChange={(e) => setParams({ report: e.target.value })}
            placeholder="e.g. summary"
            className={`${inputClass} md:w-64`}
          />
          <datalist id="alumni-report-suggestions">
            {REPORT_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : result?.error ? (
            <div className="text-center text-red-500 py-8">{result.error}</div>
          ) : (
            <ReportData key={report} data={result?.data} />
          )}
        </div>
      </Card>
    </div>
  );
}

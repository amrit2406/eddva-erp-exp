import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ReportData from '../../components/reports/ReportData';
import { exportReport, getReport, REPORT_GROUPS } from '../../api/reports.api';
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

const DEFAULT_REPORT = REPORT_GROUPS[0].reports[0];

function reportLabel(key: string): string {
  return key.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const report = params.get('report') || DEFAULT_REPORT;
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
          <p className="text-slate-600 mt-1">{reportLabel(report)}</p>
        </div>
        <Button variant="secondary" disabled={exporting} onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="px-6 pt-4 pb-3 border-b border-slate-200">
          <select
            value={report}
            onChange={(e) => setParams({ report: e.target.value })}
            className={`${inputClass} md:w-72`}
          >
            {REPORT_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.reports.map((key) => (
                  <option key={key} value={key}>
                    {reportLabel(key)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
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

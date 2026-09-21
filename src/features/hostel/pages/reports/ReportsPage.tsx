import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { exportHostelReport, getHostelReport } from '../../api/hostel.api';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { extensionForMime, saveBlob } from '../../utils/download';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { humanizeKey } from '../../utils/format';
import type { ListParams } from '../../types/hostel.types';

// The API takes the report's name in the path but the set of names isn't listed
// anywhere yet, so these are educated guesses. Any other name can be typed in.
const SUGGESTED_REPORTS = [
  'occupancy',
  'fee-collection',
  'fee-defaulters',
  'attendance',
  'gate-passes',
  'complaints',
  'discipline',
  'mess',
];

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function ReportsPage() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const report = params.get('report');
  const [draft, setDraft] = useState(report ?? '');
  const [exporting, setExporting] = useState(false);

  const load = useCallback((listParams: ListParams) => getHostelReport(report ?? '', listParams), [report]);

  const open = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDraft(trimmed);
    setParams({ report: trimmed });
  };

  const handleExport = async () => {
    if (!report) return;
    try {
      setExporting(true);
      const { blob, filename } = await exportHostelReport(report);
      const extension = extensionForMime(blob.type);
      saveBlob(blob, filename ?? `hostel-${report}-report${extension ? `.${extension}` : ''}`);
    } catch (err) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to export the report'));
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
            {report ? humanizeKey(report.replace(/-/g, '_')) : 'Pick a report to view, or type a report name'}
          </p>
        </div>
        {report && (
          <Button variant="secondary" disabled={exporting} onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        )}
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_REPORTS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => open(name)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  report === name ? 'bg-[#008BE9] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {humanizeKey(name.replace(/-/g, '_'))}
              </button>
            ))}
          </div>
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              open(draft);
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Or type a report name, e.g. fee-collection"
              aria-label="Report name"
              className={`${inputClass} sm:w-80`}
            />
            <Button type="submit" variant="secondary" disabled={!draft.trim()}>
              View Report
            </Button>
          </form>
        </div>

        {report ? (
          <RecordPanel key={report} load={load} emptyMessage="This report has no data" />
        ) : (
          <div className="p-8 text-center text-slate-500">No report selected</div>
        )}
      </Card>
    </div>
  );
}

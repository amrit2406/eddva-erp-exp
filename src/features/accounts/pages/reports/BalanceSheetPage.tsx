import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { getBalanceSheet, downloadBalanceSheetPdf } from '../../api/reports.api';
import { getApiErrorMessage } from '../../utils/errors';
import { downloadBlob } from '../../utils/downloadBlob';
import { today } from '../../utils/reportDates';
import type { BalanceSheetReport } from '../../types/report.types';

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(today());
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await getBalanceSheet(asOfDate);
      setReport(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load balance sheet'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      const blob = await downloadBalanceSheetPdf(asOfDate);
      downloadBlob(blob, `balance-sheet-${asOfDate}.pdf`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(getApiErrorMessage(err, 'Failed to download PDF'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/accounts/reports" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Balance Sheet</h1>
          <p className="text-slate-600 mt-1">Assets, liabilities, and equity as of a given date</p>
        </div>
        <form onSubmit={load} className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">As Of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              required
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Apply
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Downloading...' : 'PDF'}
          </Button>
        </form>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(
              [
                { key: 'assets', label: 'Assets', lines: report.assets },
                { key: 'liabilities', label: 'Liabilities', lines: report.liabilities },
                { key: 'equity', label: 'Equity', lines: report.equity },
              ] as const
            ).map((section) => {
              const total = section.lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
              return (
                <Card key={section.key} className="border-slate-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">{section.label}</h3>
                    <div className="space-y-2">
                      {section.lines.length === 0 ? (
                        <p className="text-sm text-slate-500">No entries.</p>
                      ) : (
                        section.lines.map((line) => (
                          <div key={line.accountId} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">{line.accountName}</span>
                            <span className="text-slate-900 font-medium">₹{Number(line.amount).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900 border-t border-slate-200 mt-4 pt-3">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {report.currentPeriodSurplus != null && (
            <Card className="border-slate-200">
              <div className="p-6 flex items-center justify-between text-sm">
                <span className="text-slate-600">Current Period Surplus / Deficit</span>
                <span className="font-semibold text-slate-900">₹{Number(report.currentPeriodSurplus).toFixed(2)}</span>
              </div>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

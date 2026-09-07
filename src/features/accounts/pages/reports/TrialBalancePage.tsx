import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getTrialBalance, downloadTrialBalancePdf } from '../../api/reports.api';
import { getFinancialYears, getOpenFinancialYear } from '../../api/financialYears.api';
import { getApiErrorMessage } from '../../utils/errors';
import { downloadBlob } from '../../utils/downloadBlob';
import type { TrialBalanceReport } from '../../types/report.types';
import type { FinancialYear } from '../../types/financialYear.types';

export default function TrialBalancePage() {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [fyId, setFyId] = useState('');
  const [report, setReport] = useState<TrialBalanceReport | null>(null);
  const [loadingYears, setLoadingYears] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    try {
      setLoadingYears(true);
      const [years, openFy] = await Promise.all([getFinancialYears(), getOpenFinancialYear()]);
      setFinancialYears(years);
      const defaultFyId = openFy?.id ?? years[0]?.id ?? '';
      setFyId(defaultFyId);
      if (defaultFyId) await load(defaultFyId);
    } catch (err: any) {
      if (err.response?.status === 401) return;
    } finally {
      setLoadingYears(false);
    }
  }

  async function load(id: string, e?: React.FormEvent) {
    e?.preventDefault();
    if (!id) {
      setError('Please select a financial year.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getTrialBalance(id);
      setReport(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load trial balance'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!fyId) return;
    try {
      setDownloading(true);
      const blob = await downloadTrialBalancePdf(fyId);
      const fyLabel = financialYears.find((fy) => fy.id === fyId)?.fyLabel ?? fyId;
      downloadBlob(blob, `trial-balance-${fyLabel}.pdf`);
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
          <h1 className="text-2xl font-bold text-slate-900">Trial Balance</h1>
          <p className="text-slate-600 mt-1">Ledger account balances for a financial year</p>
        </div>
        <form onSubmit={(e) => load(fyId, e)} className="flex items-end gap-3">
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Financial Year</label>
            <Select
              value={fyId}
              onChange={(e) => setFyId(e.target.value)}
              placeholder={loadingYears ? 'Loading...' : 'Select a financial year'}
              disabled={loadingYears}
              options={financialYears.map((fy) => ({
                value: fy.id,
                label: fy.status === 'OPEN' ? `${fy.fyLabel} (Open)` : fy.fyLabel,
              }))}
              required
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" disabled={!fyId || loading}>
            {loading ? 'Loading...' : 'Apply'}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleDownloadPdf} disabled={!fyId || downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Downloading...' : 'PDF'}
          </Button>
        </form>
      </div>

      {loadingYears ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : report ? (
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Account Code</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Account Name</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Debit</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        No account balances for this financial year.
                      </td>
                    </tr>
                  ) : (
                    report.rows.map((row) => (
                      <tr key={row.accountId} className="border-b border-slate-100">
                        <td className="py-2 px-4 text-sm text-slate-600 font-mono">{row.accountCode}</td>
                        <td className="py-2 px-4 text-sm text-slate-900">{row.accountName}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">
                          {row.debit ? `₹${Number(row.debit).toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">
                          {row.credit ? `₹${Number(row.credit).toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-semibold">
                    <td colSpan={2} className="py-2 px-4 text-sm text-slate-700 text-right">
                      Total
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-900 text-right">₹{Number(report.totalDebit).toFixed(2)}</td>
                    <td className="py-2 px-4 text-sm text-slate-900 text-right">₹{Number(report.totalCredit).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

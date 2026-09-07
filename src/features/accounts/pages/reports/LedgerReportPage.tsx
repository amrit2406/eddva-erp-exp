import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { getLedgerReport } from '../../api/reports.api';
import { getLedgerAccounts } from '../../api/coa.api';
import { getOpenFinancialYear } from '../../api/financialYears.api';
import { getApiErrorMessage } from '../../utils/errors';
import { buildReportParams } from '../../utils/buildReportParams';
import { today, firstDayOfMonth } from '../../utils/reportDates';
import type { LedgerReport } from '../../types/report.types';
import type { LedgerAccount } from '../../types/coa.types';

export default function LedgerReportPage() {
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [accountId, setAccountId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState<LedgerReport | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
    loadDefaultDates();
  }, []);

  async function loadAccounts() {
    try {
      setLoadingAccounts(true);
      const data = await getLedgerAccounts();
      setAccounts(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function loadDefaultDates() {
    try {
      const openFy = await getOpenFinancialYear();
      setFromDate(openFy ? openFy.startDate.slice(0, 10) : firstDayOfMonth());
      setToDate(openFy ? openFy.endDate.slice(0, 10) : today());
    } catch {
      setFromDate(firstDayOfMonth());
      setToDate(today());
    }
  }

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    if (!accountId) {
      setError('Please select an account.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const params = buildReportParams(fromDate, toDate);
      const data = await getLedgerReport(accountId, params.from, params.to);
      setReport(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load ledger report'));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!accountId && !!fromDate && !!toDate;

  return (
    <div className="space-y-6">
      <Link to="/accounts/reports" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ledger Report</h1>
        <p className="text-slate-600 mt-1">View transaction history for a single ledger account</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-4">
          <form onSubmit={loadReport} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Account</label>
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder={loadingAccounts ? 'Loading accounts...' : 'Select an account'}
                disabled={loadingAccounts}
                options={accounts.map((a) => ({ value: a.id, label: `${a.accountCode} — ${a.accountName}` }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" disabled={loading || !canSubmit}>
              {loading ? 'Loading...' : 'View Ledger'}
            </Button>
          </form>
        </div>
      </Card>

      {error && (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      )}

      {report && (
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {report.account.accountCode} — {report.account.accountName}
              </h3>
              <div className="text-sm text-slate-600">
                Opening: ₹{Number(report.openingBalance.amount).toFixed(2)} {report.openingBalance.type}
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Voucher</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Narration</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Debit</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Credit</th>
                    <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {report.entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No transactions in this date range.
                      </td>
                    </tr>
                  ) : (
                    report.entries.map((entry, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 px-4 text-sm text-slate-600">{new Date(entry.voucherDate).toLocaleDateString()}</td>
                        <td className="py-2 px-4 text-sm text-slate-900">
                          {entry.voucherType} {entry.voucherNumber}
                        </td>
                        <td className="py-2 px-4 text-sm text-slate-600">{entry.narration || '—'}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">
                          {entry.debit ? `₹${Number(entry.debit).toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">
                          {entry.credit ? `₹${Number(entry.credit).toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">
                          ₹{Number(entry.runningBalance).toFixed(2)} {entry.runningBalanceType}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 text-sm font-semibold text-slate-900">
              Closing Balance: ₹{Number(report.closingBalance.amount).toFixed(2)} {report.closingBalance.type}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

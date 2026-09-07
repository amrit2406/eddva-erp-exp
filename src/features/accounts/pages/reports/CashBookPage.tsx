import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import DateRangeFilter from '../../components/reports/DateRangeFilter';
import AccountBookReportView from '../../components/reports/AccountBookReportView';
import { getCashBook } from '../../api/reports.api';
import { getOpenFinancialYear } from '../../api/financialYears.api';
import { getApiErrorMessage } from '../../utils/errors';
import { buildReportParams } from '../../utils/buildReportParams';
import { today, firstDayOfMonth } from '../../utils/reportDates';
import type { AccountBookReport } from '../../types/report.types';

export default function CashBookPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState<AccountBookReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    let from = firstDayOfMonth();
    let to = today();
    try {
      const openFy = await getOpenFinancialYear();
      if (openFy) {
        from = openFy.startDate.slice(0, 10);
        to = openFy.endDate.slice(0, 10);
      }
    } catch {
      // fall back to defaults
    }
    setFromDate(from);
    setToDate(to);
    await load(from, to);
  }

  async function load(from: string, to: string) {
    try {
      setLoading(true);
      setError(null);
      const params = buildReportParams(from, to);
      const data = await getCashBook(params.from, params.to);
      setReport(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load cash book'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/accounts/reports" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Reports
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash Book</h1>
          <p className="text-slate-600 mt-1">All cash account transactions for the selected date range</p>
        </div>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onSubmit={() => load(fromDate, toDate)}
        />
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
        <Card className="border-slate-200">
          <div className="p-4">
            <AccountBookReportView report={report} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}

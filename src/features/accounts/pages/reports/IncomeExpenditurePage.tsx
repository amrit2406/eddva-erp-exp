import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import DateRangeFilter from '../../components/reports/DateRangeFilter';
import { getIncomeExpenditure } from '../../api/reports.api';
import { getOpenFinancialYear } from '../../api/financialYears.api';
import { getApiErrorMessage } from '../../utils/errors';
import { buildReportParams } from '../../utils/buildReportParams';
import { today, firstDayOfMonth } from '../../utils/reportDates';
import { cn } from '../../../../utils/cn';
import type { IncomeExpenditureReport } from '../../types/report.types';

export default function IncomeExpenditurePage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState<IncomeExpenditureReport | null>(null);
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
      const data = await getIncomeExpenditure(params.from, params.to);
      setReport(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load income & expenditure report'));
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
          <h1 className="text-2xl font-bold text-slate-900">Income &amp; Expenditure</h1>
          <p className="text-slate-600 mt-1">Income and expenditure summary for the selected period</p>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Income</h3>
                <div className="space-y-2">
                  {report.income.length === 0 ? (
                    <p className="text-sm text-slate-500">No income recorded.</p>
                  ) : (
                    report.income.map((line) => (
                      <div key={line.accountId} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{line.accountName}</span>
                        <span className="text-slate-900 font-medium">₹{Number(line.amount).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900 border-t border-slate-200 mt-4 pt-3">
                  <span>Total Income</span>
                  <span>₹{Number(report.totalIncome).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Expenditure</h3>
                <div className="space-y-2">
                  {report.expenditure.length === 0 ? (
                    <p className="text-sm text-slate-500">No expenditure recorded.</p>
                  ) : (
                    report.expenditure.map((line) => (
                      <div key={line.accountId} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{line.accountName}</span>
                        <span className="text-slate-900 font-medium">₹{Number(line.amount).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900 border-t border-slate-200 mt-4 pt-3">
                  <span>Total Expenditure</span>
                  <span>₹{Number(report.totalExpenditure).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div
              className={cn(
                'p-6 flex items-center justify-between text-lg font-semibold',
                report.surplusOrDeficit >= 0 ? 'text-green-700' : 'text-red-700'
              )}
            >
              <span>{report.surplusOrDeficit >= 0 ? 'Net Surplus' : 'Net Deficit'}</span>
              <span>₹{Math.abs(Number(report.surplusOrDeficit)).toFixed(2)}</span>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

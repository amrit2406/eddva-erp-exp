import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import DateRangeFilter from '../../components/reports/DateRangeFilter';
import VoucherTable from '../../components/vouchers/VoucherTable';
import { getDayBook } from '../../api/reports.api';
import { getApiErrorMessage } from '../../utils/errors';
import { today } from '../../utils/reportDates';
import type { Voucher } from '../../types/voucher.types';

export default function DayBookPage() {
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(from: string, to: string) {
    try {
      setLoading(true);
      setError(null);
      // Day book params are optional — the API defaults to today when both are omitted.
      const data = await getDayBook(from || undefined, to || undefined);
      setVouchers(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load day book'));
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
          <h1 className="text-2xl font-bold text-slate-900">Day Book</h1>
          <p className="text-slate-600 mt-1">All vouchers for the selected date range (defaults to today)</p>
        </div>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onSubmit={() => load(fromDate, toDate)}
          required={false}
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
      ) : (
        <Card className="border-slate-200">
          <VoucherTable vouchers={vouchers} />
        </Card>
      )}
    </div>
  );
}

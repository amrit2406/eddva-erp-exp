import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Lock, LockOpen } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getFinancialYear, closeFinancialYear } from '../../api/financialYears.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { FinancialYear } from '../../types/financialYear.types';

export default function FinancialYearDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [financialYear, setFinancialYear] = useState<FinancialYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getFinancialYear(id);
      setFinancialYear(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load financial year'));
    } finally {
      setLoading(false);
    }
  }

  const handleClose = async () => {
    if (!id || !financialYear) return;
    if (
      !window.confirm(
        `Close financial year "${financialYear.fyLabel}"? This permanently locks it against further voucher entries and cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setClosing(true);
      const updated = await closeFinancialYear(id);
      setFinancialYear(updated);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(getApiErrorMessage(err, 'Failed to close financial year'));
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!financialYear) {
    return <div className="text-center py-8 text-slate-500">Financial year not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/accounts/financial-years"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Financial Years
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-slate-400" />
            {financialYear.fyLabel}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                financialYear.isClosed ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'
              )}
            >
              {financialYear.isClosed ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
              {financialYear.isClosed ? 'Closed' : 'Open'}
            </span>
          </h1>
        </div>
        {!financialYear.isClosed && (
          <Button variant="secondary" onClick={handleClose} disabled={closing}>
            <Lock className="h-4 w-4 mr-2" />
            {closing ? 'Closing...' : 'Close Year'}
          </Button>
        )}
      </div>

      <Card className="border-slate-200">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500">Start Date</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {new Date(financialYear.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">End Date</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {new Date(financialYear.endDate).toLocaleDateString()}
            </p>
          </div>
          {financialYear.closedAt && (
            <div>
              <p className="text-sm text-slate-500">Closed At</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {new Date(financialYear.closedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

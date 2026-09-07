import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import FinancialYearTable from '../../components/financialYears/FinancialYearTable';
import { getFinancialYears, closeFinancialYear } from '../../api/financialYears.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { FinancialYear } from '../../types/financialYear.types';

export default function FinancialYearsPage() {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinancialYears();
  }, []);

  async function loadFinancialYears() {
    try {
      setLoading(true);
      const data = await getFinancialYears();
      setFinancialYears(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load financial years'));
    } finally {
      setLoading(false);
    }
  }

  const handleClose = async (id: string, fyLabel: string) => {
    if (
      !window.confirm(
        `Close financial year "${fyLabel}"? This permanently locks it against further voucher entries and cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await closeFinancialYear(id);
      setFinancialYears(financialYears.map((fy) => (fy.id === id ? { ...fy, isClosed: true } : fy)));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to close financial year'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Years</h1>
          <p className="text-slate-600 mt-1">Manage financial years and year-end closing</p>
        </div>
        <Link to="/accounts/financial-years/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Financial Year
          </Button>
        </Link>
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
          <FinancialYearTable financialYears={financialYears} onClose={handleClose} />
        </Card>
      )}
    </div>
  );
}

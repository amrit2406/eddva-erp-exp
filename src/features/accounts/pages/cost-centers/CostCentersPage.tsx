import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CostCenterTable from '../../components/costCenters/CostCenterTable';
import { getCostCenters } from '../../api/costCenters.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { CostCenter } from '../../types/costCenter.types';

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCostCenters();
  }, []);

  async function loadCostCenters() {
    try {
      setLoading(true);
      const data = await getCostCenters();
      setCostCenters(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load cost centers'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cost Centers</h1>
          <p className="text-slate-600 mt-1">Manage cost centers for voucher and expense allocation</p>
        </div>
        <Link to="/accounts/cost-centers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Cost Center
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
          <CostCenterTable costCenters={costCenters} />
        </Card>
      )}
    </div>
  );
}

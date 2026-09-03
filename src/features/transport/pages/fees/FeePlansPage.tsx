import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import FeePlanTable from '../../components/fees/FeePlanTable';
import { getFeePlans } from '../../api/fees.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportFeePlan } from '../../types/fee.types';

export default function FeePlansPage() {
  const [plans, setPlans] = useState<TransportFeePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      const data = await getFeePlans();
      setPlans(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load fee plans'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Plans</h1>
          <p className="text-slate-600 mt-1">Manage transport fee plans and billing cycles</p>
        </div>
        <Link to="/transport/fees/plans/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Fee Plan
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
          <FeePlanTable plans={plans} />
        </Card>
      )}
    </div>
  );
}

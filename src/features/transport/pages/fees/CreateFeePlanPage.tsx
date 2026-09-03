import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createFeePlan } from '../../api/fees.api';
import { getRoutes } from '../../api/routes.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportFeePlanFormData } from '../../types/fee.types';
import type { TransportRoute } from '../../types/route.types';

export default function CreateFeePlanPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [formData, setFormData] = useState<TransportFeePlanFormData>({
    name: '',
    basis: 'route',
    route_id: undefined,
    amount: 0,
    billing_cycle: 'monthly',
  });
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    try {
      setLoadingRoutes(true);
      const data = await getRoutes();
      setRoutes(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
    } finally {
      setLoadingRoutes(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.basis === 'route' && !formData.route_id) {
      setError('Please select a route for a route-based plan.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createFeePlan({
        ...formData,
        amount: Number(formData.amount),
        route_id: formData.basis === 'route' ? formData.route_id : undefined,
      });
      navigate('/transport/fees/plans');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create fee plan'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Fee Plan</h1>
        <p className="text-slate-600 mt-1">Create a new transport fee plan</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly City Route"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="basis" className="block text-sm font-medium text-slate-700 mb-1">
                  Basis *
                </label>
                <Select
                  id="basis"
                  value={formData.basis}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basis: e.target.value as TransportFeePlanFormData['basis'],
                      route_id: e.target.value === 'route' ? formData.route_id : undefined,
                    })
                  }
                  options={[
                    { value: 'route', label: 'Route-based' },
                    { value: 'flat', label: 'Flat Rate' },
                  ]}
                  required
                />
              </div>

              {formData.basis === 'route' && (
                <div>
                  <label htmlFor="route_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Route *
                  </label>
                  <Select
                    id="route_id"
                    value={formData.route_id ?? ''}
                    onChange={(e) => setFormData({ ...formData, route_id: Number(e.target.value) })}
                    placeholder={loadingRoutes ? 'Loading routes...' : 'Select a route'}
                    disabled={loadingRoutes}
                    options={routes.map((r) => ({ value: String(r.route_id), label: r.name }))}
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  min={0}
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="e.g., 1500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="billing_cycle" className="block text-sm font-medium text-slate-700 mb-1">
                  Billing Cycle *
                </label>
                <Select
                  id="billing_cycle"
                  value={formData.billing_cycle}
                  onChange={(e) =>
                    setFormData({ ...formData, billing_cycle: e.target.value as TransportFeePlanFormData['billing_cycle'] })
                  }
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'annually', label: 'Annually' },
                  ]}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/transport/fees/plans')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Fee Plan'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

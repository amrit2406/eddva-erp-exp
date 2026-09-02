import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createMaintenanceRecord } from '../../api/maintenance.api';
import { getAssets } from '../../api/assets.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryMaintenanceFormData } from '../../types/maintenance.types';
import type { InventoryAsset } from '../../types/asset.types';

export default function CreateMaintenancePage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<InventoryAsset[]>([]);
  const [formData, setFormData] = useState<InventoryMaintenanceFormData>({
    asset_unit_id: 0,
    issue_reported: '',
    service_date: '',
    cost: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssets({ limit: 100 }).then((r) => setAssets(r.data)).catch(() => setAssets([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createMaintenanceRecord(formData);
      navigate('/inventory/maintenance');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to report maintenance issue'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Report Issue</h1>
        <p className="text-slate-600 mt-1">Report a maintenance issue for an asset unit</p>
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
              <label htmlFor="asset_unit_id" className="block text-sm font-medium text-slate-700 mb-1">
                Asset Unit *
              </label>
              <Select
                id="asset_unit_id"
                value={formData.asset_unit_id || ''}
                onChange={(e) => setFormData({ ...formData, asset_unit_id: Number(e.target.value) })}
                placeholder="Select an asset unit"
                options={assets.map((a) => ({
                  value: String(a.asset_unit_id),
                  label: `${a.asset_tag} — ${a.item?.name ?? `Item #${a.item_id}`}`,
                }))}
                required
              />
            </div>

            <div>
              <label htmlFor="issue_reported" className="block text-sm font-medium text-slate-700 mb-1">
                Issue Reported *
              </label>
              <textarea
                id="issue_reported"
                value={formData.issue_reported}
                onChange={(e) => setFormData({ ...formData, issue_reported: e.target.value })}
                rows={3}
                placeholder="e.g., Screen flickering intermittently"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="service_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  id="service_date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-slate-700 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  id="cost"
                  min={0}
                  step="0.01"
                  value={formData.cost ?? ''}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g., 1500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/maintenance')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Reporting...' : 'Report Issue'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

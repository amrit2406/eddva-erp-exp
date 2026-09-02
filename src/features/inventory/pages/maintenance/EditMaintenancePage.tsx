import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getMaintenanceRecord, updateMaintenanceRecord } from '../../api/maintenance.api';
import { getApiErrorMessage } from '../../utils/errors';
import { MAINTENANCE_STATUS_OPTIONS } from '../../constants/maintenance.constants';
import type { InventoryMaintenanceStatus, InventoryMaintenanceUpdateData } from '../../types/maintenance.types';

export default function EditMaintenancePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [assetTag, setAssetTag] = useState('');
  const [itemName, setItemName] = useState('');
  const [issueReported, setIssueReported] = useState('');
  const [formData, setFormData] = useState<InventoryMaintenanceUpdateData>({
    status: 'reported',
    service_date: '',
    cost: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const record = await getMaintenanceRecord(id);
      setAssetTag(record.asset_unit?.asset_tag ?? `#${record.asset_unit_id}`);
      setItemName(record.asset_unit?.item?.name ?? '');
      setIssueReported(record.issue_reported);
      setFormData({
        status: record.status,
        service_date: record.service_date ? record.service_date.slice(0, 10) : '',
        cost: record.cost ?? undefined,
      });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load maintenance record'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMaintenanceRecord(id, formData);
      navigate('/inventory/maintenance');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to update maintenance record'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Maintenance Record</h1>
          <p className="text-slate-600 mt-1">Update status, service date, and cost</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Maintenance Record</h1>
        <p className="text-slate-600 mt-1 font-mono">{assetTag}</p>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Asset Unit</label>
              <input
                type="text"
                value={`${assetTag}${itemName ? ` — ${itemName}` : ''}`}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Reported</label>
              <textarea
                value={issueReported}
                disabled
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryMaintenanceStatus })}
                  options={MAINTENANCE_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
              </div>

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
                  Cost
                </label>
                <input
                  type="number"
                  id="cost"
                  min={0}
                  step="0.01"
                  value={formData.cost ?? ''}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            {formData.status === 'resolved' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                Resolving the last open ticket for this asset returns it to "In Store" automatically.
              </div>
            )}

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
                {submitting ? 'Updating...' : 'Update Record'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

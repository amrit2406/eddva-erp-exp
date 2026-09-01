import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getAsset, updateAsset } from '../../api/assets.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import { ASSET_EDITABLE_STATUS_OPTIONS } from '../../constants/asset.constants';
import type { InventoryAssetStatus, InventoryAssetUpdateData } from '../../types/asset.types';
import type { InventoryLocation } from '../../types/location.types';

export default function EditAssetPage() {
  const navigate = useNavigate();
  const { tag } = useParams<{ tag: string }>();
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [currentStatus, setCurrentStatus] = useState<InventoryAssetStatus>('in_store');
  const [formData, setFormData] = useState<InventoryAssetUpdateData>({
    serial_number: '',
    status: 'in_store',
    current_location_id: undefined,
    warranty_expiry: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  async function loadData() {
    if (!tag) return;
    try {
      setLoading(true);
      const asset = await getAsset(tag);
      setCurrentStatus(asset.status);
      setFormData({
        serial_number: asset.serial_number ?? '',
        status: asset.status,
        current_location_id: asset.current_location_id ?? undefined,
        warranty_expiry: asset.warranty_expiry ? asset.warranty_expiry.slice(0, 10) : '',
      });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load asset'));
    } finally {
      setLoading(false);
    }
  }

  const isIssued = currentStatus === 'issued';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateAsset(tag, formData);
      navigate(`/inventory/assets/${encodeURIComponent(tag)}`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to update asset'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Asset</h1>
          <p className="text-slate-600 mt-1">Update asset details</p>
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Asset</h1>
        <p className="text-slate-600 mt-1 font-mono">{tag}</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isIssued && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
              This asset is currently issued. Status changes are locked here — use the Issue/Return workflow instead.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-slate-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="e.g., SN-998877"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                {isIssued ? (
                  <input
                    type="text"
                    value="Issued"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
                  />
                ) : (
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryAssetStatus })}
                    options={ASSET_EDITABLE_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  />
                )}
              </div>

              <div>
                <label htmlFor="current_location_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Current Location
                </label>
                <Select
                  id="current_location_id"
                  value={formData.current_location_id ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, current_location_id: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="warranty_expiry" className="block text-sm font-medium text-slate-700 mb-1">
                Warranty Expiry
              </label>
              <input
                type="date"
                id="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/inventory/assets/${encodeURIComponent(tag ?? '')}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Asset'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

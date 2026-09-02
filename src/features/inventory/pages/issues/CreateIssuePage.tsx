import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import IssuesTabs from '../../components/issues/IssuesTabs';
import { createIssue } from '../../api/issues.api';
import { getItems } from '../../api/items.api';
import { getAssets } from '../../api/assets.api';
import { getHolders } from '../../api/holders.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryIssueFormData } from '../../types/issue.types';
import type { InventoryItem } from '../../types/item.types';
import type { InventoryAsset } from '../../types/asset.types';
import type { InventoryHolder } from '../../types/holder.types';
import type { InventoryLocation } from '../../types/location.types';

export default function CreateIssuePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [holders, setHolders] = useState<InventoryHolder[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [availableAssets, setAvailableAssets] = useState<InventoryAsset[]>([]);
  const [formData, setFormData] = useState<InventoryIssueFormData>({
    item_id: 0,
    asset_unit_id: undefined,
    quantity: 1,
    holder_id: 0,
    source_location_id: 0,
    issue_date: new Date().toISOString().slice(0, 10),
    expected_return_date: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems({ limit: 100 }).then((r) => setItems(r.data)).catch(() => setItems([]));
    getHolders({ limit: 100 }).then((r) => setHolders(r.data)).catch(() => setHolders([]));
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  const selectedItem = useMemo(() => items.find((i) => i.item_id === formData.item_id), [items, formData.item_id]);
  const isAsset = selectedItem?.item_type === 'asset';

  useEffect(() => {
    if (isAsset && formData.item_id) {
      getAssets({ item_id: formData.item_id, status: 'in_store', limit: 100 })
        .then((r) => setAvailableAssets(r.data))
        .catch(() => setAvailableAssets([]));
    } else {
      setAvailableAssets([]);
    }
    setFormData((f) => ({ ...f, asset_unit_id: undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.item_id, isAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAsset && !formData.asset_unit_id) {
      setError('Please select an asset unit.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const payload: InventoryIssueFormData = { ...formData };
      if (isAsset) {
        delete payload.quantity;
      } else {
        delete payload.asset_unit_id;
      }
      if (!payload.expected_return_date) delete payload.expected_return_date;
      const issue = await createIssue(payload);
      navigate(`/inventory/issues/${issue.issue_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to create issue'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Issue Item</h1>
        <p className="text-slate-600 mt-1">Issue stock or an asset unit to a holder</p>
      </div>

      <IssuesTabs />

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="item_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Item *
                </label>
                <Select
                  id="item_id"
                  value={formData.item_id || ''}
                  onChange={(e) => setFormData({ ...formData, item_id: Number(e.target.value) })}
                  placeholder="Select an item"
                  options={items.map((i) => ({ value: String(i.item_id), label: `${i.name} (${i.item_code})` }))}
                  required
                />
              </div>

              {isAsset ? (
                <div>
                  <label htmlFor="asset_unit_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Asset Unit *
                  </label>
                  <Select
                    id="asset_unit_id"
                    value={formData.asset_unit_id ?? ''}
                    onChange={(e) => setFormData({ ...formData, asset_unit_id: Number(e.target.value) })}
                    placeholder={availableAssets.length ? 'Select an asset unit' : 'No in-store units available'}
                    options={availableAssets.map((a) => ({ value: String(a.asset_unit_id), label: a.asset_tag }))}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="holder_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Holder *
                </label>
                <Select
                  id="holder_id"
                  value={formData.holder_id || ''}
                  onChange={(e) => setFormData({ ...formData, holder_id: Number(e.target.value) })}
                  placeholder="Select a holder"
                  options={holders.map((h) => ({ value: String(h.holder_id), label: `${h.name} (${h.holder_type})` }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="source_location_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Source Location *
                </label>
                <Select
                  id="source_location_id"
                  value={formData.source_location_id || ''}
                  onChange={(e) => setFormData({ ...formData, source_location_id: Number(e.target.value) })}
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  id="issue_date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="expected_return_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  id="expected_return_date"
                  value={formData.expected_return_date}
                  onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/issues')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Issuing...' : 'Issue Item'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

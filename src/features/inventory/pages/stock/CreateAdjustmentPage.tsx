import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import StockTabs from '../../components/stock/StockTabs';
import { createAdjustment } from '../../api/stock.api';
import { getItems } from '../../api/items.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import { ADJUSTMENT_REASON_OPTIONS } from '../../constants/stock.constants';
import type { InventoryAdjustmentReason } from '../../types/stock.types';
import type { InventoryItem } from '../../types/item.types';
import type { InventoryLocation } from '../../types/location.types';

const DIRECTION_OPTIONS = [
  { value: 'decrease', label: 'Decrease stock' },
  { value: 'increase', label: 'Increase stock' },
];

export default function CreateAdjustmentPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [itemId, setItemId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [reason, setReason] = useState<InventoryAdjustmentReason>('damaged');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('decrease');
  const [magnitude, setMagnitude] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems({ limit: 100 }).then((r) => setItems(r.data)).catch(() => setItems([]));
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    setDirection(reason === 'audit_correction' ? 'increase' : 'decrease');
  }, [reason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !locationId) {
      setError('Please select an item and a location.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const adjustment = await createAdjustment({
        item_id: itemId,
        location_id: locationId,
        quantity_delta: direction === 'decrease' ? -Math.abs(magnitude) : Math.abs(magnitude),
        reason,
        remarks: remarks || undefined,
      });
      navigate(`/inventory/stock/adjustments/${adjustment.adjustment_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to record adjustment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Adjustment</h1>
        <p className="text-slate-600 mt-1">Correct stock levels for damage, loss, or audit findings</p>
      </div>

      <StockTabs />

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
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Select an item"
                  options={items.map((i) => ({ value: String(i.item_id), label: `${i.name} (${i.item_code})` }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="location_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Location *
                </label>
                <Select
                  id="location_id"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                  Reason *
                </label>
                <Select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as InventoryAdjustmentReason)}
                  options={ADJUSTMENT_REASON_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="direction" className="block text-sm font-medium text-slate-700 mb-1">
                  Direction *
                </label>
                <Select
                  id="direction"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as 'increase' | 'decrease')}
                  options={DIRECTION_OPTIONS}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="magnitude" className="block text-sm font-medium text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="magnitude"
                min={1}
                value={magnitude}
                onChange={(e) => setMagnitude(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="e.g., Water damage during monsoon leak in store room"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/stock/adjustments')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Adjustment'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import StockTabs from '../../components/stock/StockTabs';
import { createTransfer } from '../../api/stock.api';
import { getItems } from '../../api/items.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryStockTransferFormData } from '../../types/stock.types';
import type { InventoryItem } from '../../types/item.types';
import type { InventoryLocation } from '../../types/location.types';

export default function CreateTransferPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [formData, setFormData] = useState<InventoryStockTransferFormData>({
    item_id: 0,
    from_location_id: 0,
    to_location_id: 0,
    quantity: 1,
    transfer_date: new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems({ limit: 100 }).then((r) => setItems(r.data)).catch(() => setItems([]));
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from_location_id === formData.to_location_id) {
      setError('From and To locations must differ.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const transfer = await createTransfer(formData);
      navigate(`/inventory/stock/transfers/${transfer.transfer_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to record transfer'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Transfer</h1>
        <p className="text-slate-600 mt-1">Move stock between locations</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from_location_id" className="block text-sm font-medium text-slate-700 mb-1">
                  From Location *
                </label>
                <Select
                  id="from_location_id"
                  value={formData.from_location_id || ''}
                  onChange={(e) => setFormData({ ...formData, from_location_id: Number(e.target.value) })}
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="to_location_id" className="block text-sm font-medium text-slate-700 mb-1">
                  To Location *
                </label>
                <Select
                  id="to_location_id"
                  value={formData.to_location_id || ''}
                  onChange={(e) => setFormData({ ...formData, to_location_id: Number(e.target.value) })}
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label htmlFor="transfer_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Transfer Date *
                </label>
                <input
                  type="date"
                  id="transfer_date"
                  value={formData.transfer_date}
                  onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/stock/transfers')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Transfer'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

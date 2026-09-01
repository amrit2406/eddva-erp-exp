import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import StockTabs from '../../components/stock/StockTabs';
import { createPurchase } from '../../api/stock.api';
import { getItems } from '../../api/items.api';
import { getVendors } from '../../api/vendors.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryStockPurchaseFormData } from '../../types/stock.types';
import type { InventoryItem } from '../../types/item.types';
import type { InventoryVendor } from '../../types/vendor.types';
import type { InventoryLocation } from '../../types/location.types';

export default function CreatePurchasePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<InventoryVendor[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [assetTagsInput, setAssetTagsInput] = useState('');
  const [formData, setFormData] = useState<InventoryStockPurchaseFormData>({
    item_id: 0,
    vendor_id: 0,
    location_id: 0,
    quantity: 1,
    unit_price: 0,
    invoice_number: '',
    purchase_date: new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems({ limit: 100 }).then((r) => setItems(r.data)).catch(() => setItems([]));
    getVendors().then(setVendors).catch(() => setVendors([]));
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  const selectedItem = useMemo(() => items.find((i) => i.item_id === formData.item_id), [items, formData.item_id]);
  const isAsset = selectedItem?.item_type === 'asset';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload: InventoryStockPurchaseFormData = { ...formData };
      if (!payload.invoice_number) delete payload.invoice_number;
      if (isAsset && assetTagsInput.trim()) {
        payload.asset_tags = assetTagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      } else {
        delete payload.asset_tags;
      }
      const purchase = await createPurchase(payload);
      navigate(`/inventory/stock/purchases/${purchase.purchase_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to record purchase'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Purchase</h1>
        <p className="text-slate-600 mt-1">Receive stock and update balances</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <label htmlFor="vendor_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor *
                </label>
                <Select
                  id="vendor_id"
                  value={formData.vendor_id || ''}
                  onChange={(e) => setFormData({ ...formData, vendor_id: Number(e.target.value) })}
                  placeholder="Select a vendor"
                  options={vendors.map((v) => ({ value: String(v.vendor_id), label: v.name }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="location_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Location *
                </label>
                <Select
                  id="location_id"
                  value={formData.location_id || ''}
                  onChange={(e) => setFormData({ ...formData, location_id: Number(e.target.value) })}
                  placeholder="Select a location"
                  options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label htmlFor="unit_price" className="block text-sm font-medium text-slate-700 mb-1">
                  Unit Price *
                </label>
                <input
                  type="number"
                  id="unit_price"
                  min={0}
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="purchase_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="invoice_number" className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="e.g., INV-2026-00123"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>

            {isAsset && (
              <div>
                <label htmlFor="asset_tags" className="block text-sm font-medium text-slate-700 mb-1">
                  Asset Tags
                </label>
                <input
                  type="text"
                  id="asset_tags"
                  value={assetTagsInput}
                  onChange={(e) => setAssetTagsInput(e.target.value)}
                  placeholder="e.g., LAPTOP-0001, LAPTOP-0002"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Comma-separated, must match quantity. Leave blank to auto-generate sequential tags.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/stock/purchases')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Purchase'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

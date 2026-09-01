import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryItemVendorFormData } from '../../types/item.types';
import type { InventoryVendor } from '../../types/vendor.types';

interface ItemVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: InventoryVendor[];
  onSubmit: (data: InventoryItemVendorFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ItemVendorModal({ isOpen, onClose, vendors, onSubmit, isLoading }: ItemVendorModalProps) {
  const [formData, setFormData] = useState<InventoryItemVendorFormData>({
    vendor_id: 0,
    last_purchase_price: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ vendor_id: 0, last_purchase_price: undefined });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor_id) {
      setError('Please select a vendor.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save vendor pricing'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vendor Pricing" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vendor *</label>
          <Select
            value={formData.vendor_id || ''}
            onChange={(e) => setFormData({ ...formData, vendor_id: Number(e.target.value) })}
            placeholder="Select a vendor"
            options={vendors.map((v) => ({ value: String(v.vendor_id), label: v.name }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Purchase Price</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={formData.last_purchase_price ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                last_purchase_price: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 250.50"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { BookCopy, BookCopyUpdateData } from '../../types/library.types';

interface EditCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  copy: BookCopy | null;
  onSubmit: (id: number, data: BookCopyUpdateData) => Promise<void>;
  isLoading?: boolean;
}

export default function EditCopyModal({ isOpen, onClose, copy, onSubmit, isLoading }: EditCopyModalProps) {
  const [formData, setFormData] = useState<BookCopyUpdateData>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (copy) {
      setFormData({
        barcode: copy.barcode,
        rack_location: copy.rack_location,
        condition: copy.condition,
        acquired_date: copy.acquired_date ? copy.acquired_date.split('T')[0] : '',
        price: Number(copy.price),
        status: copy.status,
      });
    }
  }, [copy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copy) return;
    setError(null);
    try {
      await onSubmit(copy.copy_id, formData);
    } catch (err: any) {
      setError(err.message || 'Failed to update copy');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Copy" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
          <input
            type="text"
            value={formData.barcode || ''}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., BC-001-2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rack Location</label>
          <input
            type="text"
            value={formData.rack_location || ''}
            onChange={(e) => setFormData({ ...formData, rack_location: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Shelf A-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
          <select
            value={formData.condition || 'new'}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Acquired Date</label>
          <input
            type="date"
            value={formData.acquired_date || ''}
            onChange={(e) => setFormData({ ...formData, acquired_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={formData.status || 'available'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="available">Available</option>
            <option value="issued">Issued</option>
            <option value="reserved">Reserved</option>
            <option value="lost">Lost</option>
            <option value="under_repair">Under Repair</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Copy'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

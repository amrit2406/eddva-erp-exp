import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { BookCopyFormData } from '../../types/library.types';

interface CreateCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookCopyFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateCopyModal({ isOpen, onClose, onSubmit, isLoading }: CreateCopyModalProps) {
  const [formData, setFormData] = useState<BookCopyFormData>({
    barcode: '',
    rack_location: '',
    condition: 'new',
    acquired_date: new Date().toISOString().split('T')[0],
    price: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
      setFormData({
        barcode: '',
        rack_location: '',
        condition: 'new',
        acquired_date: new Date().toISOString().split('T')[0],
        price: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create copy');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Copy" size="lg">
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
            required
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., BC-001-2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rack Location</label>
          <input
            type="text"
            required
            value={formData.rack_location}
            onChange={(e) => setFormData({ ...formData, rack_location: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Shelf A-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
          <select
            value={formData.condition}
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
            required
            value={formData.acquired_date}
            onChange={(e) => setFormData({ ...formData, acquired_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Copy'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

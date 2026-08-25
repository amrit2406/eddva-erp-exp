import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { Fine, FineWaiveFormData } from '../../types/library.types';

interface WaiveFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: Fine | null;
  onSubmit: (id: number, data: FineWaiveFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function WaiveFineModal({ isOpen, onClose, fine, onSubmit, isLoading }: WaiveFineModalProps) {
  const [formData, setFormData] = useState<FineWaiveFormData>({
    reason: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fine) return;
    setError(null);
    try {
      await onSubmit(fine.fine_id, formData);
      setFormData({ reason: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to waive fine');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Waive Fine" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {fine && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Fine Amount:</span> ₹{fine.amount.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Reason:</span> {fine.reason}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Waive Reason</label>
          <textarea
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Financial hardship approved by principal"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Waiving...' : 'Waive Fine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

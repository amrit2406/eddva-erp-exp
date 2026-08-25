import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import type { Fine, FinePayFormData } from '../../types/library.types';

interface PayFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: Fine | null;
  onSubmit: (id: number, data: FinePayFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function PayFineModal({ isOpen, onClose, fine, onSubmit, isLoading }: PayFineModalProps) {
  const [formData, setFormData] = useState<FinePayFormData>({
    amount_paid: 0,
    payment_mode: 'cash',
    transaction_ref: '',
    received_by: 1,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fine) return;
    setError(null);
    try {
      await onSubmit(fine.fine_id, formData);
      setFormData({
        amount_paid: 0,
        payment_mode: 'cash',
        transaction_ref: '',
        received_by: 1,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to pay fine');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay Fine" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {fine && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Total Fine Amount:</span> ₹{fine.amount.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Already Paid:</span> ₹{fine.amount_paid.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Remaining:</span> ₹{(fine.amount - fine.amount_paid).toFixed(2)}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay (₹)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount_paid}
            onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
          <select
            required
            value={formData.payment_mode}
            onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Reference</label>
          <input
            type="text"
            required
            value={formData.transaction_ref}
            onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., TXN-2024-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Received By (User ID)</label>
          <input
            type="number"
            required
            value={formData.received_by}
            onChange={(e) => setFormData({ ...formData, received_by: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Pay Fine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

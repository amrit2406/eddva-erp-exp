import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryRejectFormData } from '../../types/issue.types';

interface RejectIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryRejectFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function RejectIssueModal({ isOpen, onClose, onSubmit, isLoading }: RejectIssueModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ rejection_reason: rejectionReason.trim() });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reject issue'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Issue" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason *</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="e.g., Requested quantity exceeds department budget for this term"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Rejecting...' : 'Reject Issue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

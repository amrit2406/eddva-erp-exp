import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { COMPLAINT_PRIORITY_OPTIONS } from '../../constants/complaint.constants';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { ChangeComplaintPriorityFormData, FrontOfficeComplaintPriority } from '../../types/complaintRecord.types';

interface ChangePriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPriority: FrontOfficeComplaintPriority;
  onSubmit: (data: ChangeComplaintPriorityFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ChangePriorityModal({ isOpen, onClose, currentPriority, onSubmit, isLoading }: ChangePriorityModalProps) {
  const [priority, setPriority] = useState<FrontOfficeComplaintPriority>(currentPriority);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPriority(currentPriority);
      setReason('');
      setError(null);
    }
  }, [isOpen, currentPriority]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ priority, reason: reason || undefined });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change priority'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Priority" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority *</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as FrontOfficeComplaintPriority)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {COMPLAINT_PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Water leak is worsening"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update Priority'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

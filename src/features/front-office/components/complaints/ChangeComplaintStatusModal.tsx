import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants/complaint.constants';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { ChangeComplaintStatusFormData, FrontOfficeComplaintStatus } from '../../types/complaintRecord.types';

interface ChangeComplaintStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: FrontOfficeComplaintStatus;
  onSubmit: (data: ChangeComplaintStatusFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ChangeComplaintStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onSubmit,
  isLoading,
}: ChangeComplaintStatusModalProps) {
  const options = COMPLAINT_STATUS_OPTIONS.filter((opt) => opt.value !== currentStatus);
  const [status, setStatus] = useState<FrontOfficeComplaintStatus | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('');
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      setError('Select a status.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ status, reason: reason || undefined });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change status'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Status" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <p className="text-sm text-slate-500">
          Current status: <span className="font-medium text-slate-900 capitalize">{currentStatus.replace('_', ' ')}</span>
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Status *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FrontOfficeComplaintStatus)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select status</option>
            {options.map((opt) => (
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
            placeholder="e.g., Reopening at complainant's request"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

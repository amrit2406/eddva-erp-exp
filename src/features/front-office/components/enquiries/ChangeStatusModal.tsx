import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { ChangeEnquiryStatusFormData, FrontOfficeEnquiryStatus } from '../../types/enquiryRecord.types';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: FrontOfficeEnquiryStatus;
  onSubmit: (data: ChangeEnquiryStatusFormData) => Promise<void>;
  isLoading?: boolean;
}

const ALLOWED_TRANSITIONS: Record<FrontOfficeEnquiryStatus, FrontOfficeEnquiryStatus[]> = {
  open: ['in_progress', 'closed'],
  in_progress: ['closed'],
  closed: [],
};

const STATUS_LABEL: Record<FrontOfficeEnquiryStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export default function ChangeStatusModal({ isOpen, onClose, currentStatus, onSubmit, isLoading }: ChangeStatusModalProps) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  const [status, setStatus] = useState<FrontOfficeEnquiryStatus | ''>('');
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
      {allowed.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">This enquiry is closed and cannot transition to another status.</p>
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <p className="text-sm text-slate-500">
            Current status: <span className="font-medium text-slate-900">{STATUS_LABEL[currentStatus]}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FrontOfficeEnquiryStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select status</option>
              {allowed.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
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
              placeholder="e.g., Enquirer confirmed enrollment elsewhere"
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
      )}
    </Modal>
  );
}

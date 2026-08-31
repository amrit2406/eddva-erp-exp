import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { CancelAppointmentFormData } from '../../types/appointmentRecord.types';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CancelAppointmentFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CancelAppointmentModal({ isOpen, onClose, onSubmit, isLoading }: CancelAppointmentModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ reason: reason || undefined });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to cancel appointment'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Appointment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Visitor requested cancellation"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Keep Appointment
          </Button>
          <Button type="submit" variant="danger" disabled={isLoading}>
            {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

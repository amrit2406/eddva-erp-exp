import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { CompleteAppointmentFormData } from '../../types/appointmentRecord.types';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompleteAppointmentFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CompleteAppointmentModal({ isOpen, onClose, onSubmit, isLoading }: CompleteAppointmentModalProps) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ notes: notes || undefined });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to complete appointment'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Appointment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Discussed admission requirements, follow-up email sent"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Mark Completed'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

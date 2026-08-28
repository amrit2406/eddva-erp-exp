import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { AvailabilitySlot, AvailabilitySlotFormData } from '../../types/employeeRecord.types';

interface AvailabilitySlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: AvailabilitySlot | null;
  onSubmit: (data: AvailabilitySlotFormData) => Promise<void>;
  isLoading?: boolean;
}

function toDateInput(value: string): string {
  return value ? value.slice(0, 10) : '';
}

export default function AvailabilitySlotModal({ isOpen, onClose, slot, onSubmit, isLoading }: AvailabilitySlotModalProps) {
  const [formData, setFormData] = useState<AvailabilitySlotFormData>({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        slot
          ? {
              date: toDateInput(slot.date),
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_available: slot.is_available,
            }
          : { date: '', start_time: '09:00', end_time: '17:00', is_available: true }
      );
      setError(null);
    }
  }, [isOpen, slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.start_time >= formData.end_time) {
      setError('End time must be after start time.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save availability slot'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={slot ? 'Edit Availability Slot' : 'Add Availability Slot'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
            <input
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
            <input
              type="time"
              required
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={formData.is_available ?? true}
            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
          />
          Available in this slot
        </label>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : slot ? 'Update Slot' : 'Add Slot'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

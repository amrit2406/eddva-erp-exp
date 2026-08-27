import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getParticipants } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { AddHouseMemberFormData, HouseMembershipStatus, SportsParticipant } from '../../types/sports.types';

interface AddHouseMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddHouseMemberFormData) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'transferred', label: 'Transferred' },
];

export default function AddHouseMemberModal({ isOpen, onClose, onSubmit, isLoading }: AddHouseMemberModalProps) {
  const [participants, setParticipants] = useState<SportsParticipant[]>([]);
  const [formData, setFormData] = useState<AddHouseMemberFormData>({
    participant_id: 0,
    academic_year: '2026-27',
    status: 'active',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getParticipants().then(setParticipants).catch(() => setParticipants([]));
      setFormData({ participant_id: 0, academic_year: '2026-27', status: 'active' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.participant_id) {
      setError('Select a participant.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add member'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add House Member" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Participant *</label>
          <select
            value={formData.participant_id || ''}
            onChange={(e) => setFormData({ ...formData, participant_id: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a participant</option>
            {participants.map((p) => (
              <option key={p.participant_id} value={p.participant_id}>
                {p.name} {p.class_section ? `(${p.class_section})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year *</label>
          <input
            type="text"
            required
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            placeholder="e.g., 2026-27"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as HouseMembershipStatus })}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

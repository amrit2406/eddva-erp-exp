import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { Fixture, RecordPlayerStatFormData } from '../../types/sports.types';

interface RecordPlayerStatModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: Fixture | null;
  onSubmit: (data: RecordPlayerStatFormData) => Promise<void>;
  isLoading?: boolean;
}

const STAT_TYPE_SUGGESTIONS = ['goals', 'runs', 'points', 'time', 'distance'];

export default function RecordPlayerStatModal({ isOpen, onClose, fixture, onSubmit, isLoading }: RecordPlayerStatModalProps) {
  const [formData, setFormData] = useState<RecordPlayerStatFormData>({
    participant_id: 0,
    stat_type: '',
    stat_value: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const eligibleParticipants = [
    ...(fixture?.team_a?.members ?? []),
    ...(fixture?.team_b?.members ?? []),
  ].filter((m) => m.participant);

  useEffect(() => {
    if (isOpen) {
      setFormData({ participant_id: 0, stat_type: '', stat_value: 0 });
      setError(null);
    }
  }, [isOpen, fixture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.participant_id) {
      setError('Select a participant.');
      return;
    }
    if (!formData.stat_type.trim()) {
      setError('Enter a stat type.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to record stat'));
    }
  };

  if (!fixture) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Player Stat — ${fixture.round}`} size="md">
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
            <option value="">Select participant</option>
            {eligibleParticipants.map((m) => (
              <option key={m.participant_id} value={m.participant_id}>
                {m.participant?.name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stat Type *</label>
            <input
              type="text"
              required
              list="stat-type-suggestions"
              value={formData.stat_type}
              onChange={(e) => setFormData({ ...formData, stat_type: e.target.value })}
              placeholder="e.g., goals"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="stat-type-suggestions">
              {STAT_TYPE_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Value *</label>
            <input
              type="number"
              step="any"
              required
              value={formData.stat_value}
              onChange={(e) => setFormData({ ...formData, stat_value: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Record Stat'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getVenues } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FixtureFormData, FixtureStatus, TournamentTeam, Venue } from '../../types/sports.types';

interface CreateFixtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TournamentTeam[];
  onSubmit: (data: FixtureFormData) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'walkover', label: 'Walkover' },
];

export default function CreateFixtureModal({ isOpen, onClose, teams, onSubmit, isLoading }: CreateFixtureModalProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [formData, setFormData] = useState<FixtureFormData>({
    round: '',
    team_a_id: 0,
    team_b_id: 0,
    venue_id: undefined,
    scheduled_date: '',
    status: 'scheduled',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getVenues().then(setVenues).catch(() => setVenues([]));
      setFormData({ round: '', team_a_id: 0, team_b_id: 0, venue_id: undefined, scheduled_date: '', status: 'scheduled' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.team_a_id || !formData.team_b_id) {
      setError('Select both teams.');
      return;
    }
    if (formData.team_a_id === formData.team_b_id) {
      setError('Team A and Team B cannot be the same team.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ ...formData, scheduled_date: new Date(formData.scheduled_date).toISOString() });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create fixture'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Fixture" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Round *</label>
          <input
            type="text"
            required
            value={formData.round}
            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
            placeholder="e.g., Finals"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team A *</label>
            <select
              value={formData.team_a_id || ''}
              onChange={(e) => setFormData({ ...formData, team_a_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select team</option>
              {teams.map((t) => (
                <option key={t.tournament_team_id} value={t.tournament_team_id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team B *</label>
            <select
              value={formData.team_b_id || ''}
              onChange={(e) => setFormData({ ...formData, team_b_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select team</option>
              {teams.map((t) => (
                <option key={t.tournament_team_id} value={t.tournament_team_id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
            <select
              value={formData.venue_id ?? ''}
              onChange={(e) => setFormData({ ...formData, venue_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No venue</option>
              {venues.map((v) => (
                <option key={v.venue_id} value={v.venue_id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as FixtureStatus })}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Scheduling...' : 'Schedule Fixture'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

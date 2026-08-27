import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { Fixture, RecordResultFormData } from '../../types/sports.types';

interface RecordResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: Fixture | null;
  onSubmit: (data: RecordResultFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function RecordResultModal({ isOpen, onClose, fixture, onSubmit, isLoading }: RecordResultModalProps) {
  const [formData, setFormData] = useState<RecordResultFormData>({
    team_a_score: '',
    team_b_score: '',
    winner_team_id: undefined,
    result_notes: '',
    house_points_award: undefined,
    academic_year: '2026-27',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        team_a_score: '',
        team_b_score: '',
        winner_team_id: undefined,
        result_notes: '',
        house_points_award: undefined,
        academic_year: '2026-27',
      });
      setError(null);
    }
  }, [isOpen, fixture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to record result'));
    }
  };

  if (!fixture) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Result — ${fixture.round}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {fixture.team_a?.team_name ?? 'Team A'} Score *
            </label>
            <input
              type="text"
              required
              value={formData.team_a_score}
              onChange={(e) => setFormData({ ...formData, team_a_score: e.target.value })}
              placeholder="e.g., 3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {fixture.team_b?.team_name ?? 'Team B'} Score *
            </label>
            <input
              type="text"
              required
              value={formData.team_b_score}
              onChange={(e) => setFormData({ ...formData, team_b_score: e.target.value })}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Winner</label>
          <select
            value={formData.winner_team_id ?? ''}
            onChange={(e) => setFormData({ ...formData, winner_team_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Draw / no winner</option>
            <option value={fixture.team_a_id}>{fixture.team_a?.team_name ?? 'Team A'}</option>
            <option value={fixture.team_b_id}>{fixture.team_b?.team_name ?? 'Team B'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Result Notes</label>
          <textarea
            rows={2}
            value={formData.result_notes}
            onChange={(e) => setFormData({ ...formData, result_notes: e.target.value })}
            placeholder="e.g., Great match, 2 goals scored in second half"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">House Points to Award</label>
            <input
              type="number"
              value={formData.house_points_award ?? ''}
              onChange={(e) => setFormData({ ...formData, house_points_award: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="e.g., 50 (winner's house)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="e.g., 2026-27"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          If the winner is linked to a House and points are set, points are awarded to that House automatically.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Record Result'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

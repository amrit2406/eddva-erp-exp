import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getParticipants, getTeams } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { IssueAwardFormData, SportsParticipant, TournamentTeam } from '../../types/sports.types';

interface IssueAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: number | '';
  onSubmit: (data: IssueAwardFormData) => Promise<void>;
  isLoading?: boolean;
}

const AWARD_TYPE_SUGGESTIONS = ['Gold Medal', 'Silver Medal', 'Bronze Medal', 'MVP', 'Best Bowler', 'Certificate'];

export default function IssueAwardModal({ isOpen, onClose, tournamentId, onSubmit, isLoading }: IssueAwardModalProps) {
  const [participants, setParticipants] = useState<SportsParticipant[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [formData, setFormData] = useState<IssueAwardFormData>({
    participant_id: undefined,
    tournament_team_id: undefined,
    award_type: '',
    issued_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tournamentId) {
      getParticipants().then(setParticipants).catch(() => setParticipants([]));
      getTeams(tournamentId).then(setTeams).catch(() => setTeams([]));
      setFormData({
        participant_id: undefined,
        tournament_team_id: undefined,
        award_type: '',
        issued_date: new Date().toISOString().slice(0, 10),
      });
      setError(null);
    }
  }, [isOpen, tournamentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.award_type.trim()) {
      setError('Enter an award type.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to issue award'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Award" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Award Type *</label>
          <input
            type="text"
            required
            list="award-type-suggestions"
            value={formData.award_type}
            onChange={(e) => setFormData({ ...formData, award_type: e.target.value })}
            placeholder="e.g., Gold Medal"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="award-type-suggestions">
            {AWARD_TYPE_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recipient (Participant)</label>
          <select
            value={formData.participant_id ?? ''}
            onChange={(e) => setFormData({ ...formData, participant_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            {participants.map((p) => (
              <option key={p.participant_id} value={p.participant_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recipient (Team)</label>
          <select
            value={formData.tournament_team_id ?? ''}
            onChange={(e) => setFormData({ ...formData, tournament_team_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            {teams.map((t) => (
              <option key={t.tournament_team_id} value={t.tournament_team_id}>
                {t.team_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Issued Date *</label>
          <input
            type="date"
            required
            value={formData.issued_date}
            onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Issuing...' : 'Issue Award'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

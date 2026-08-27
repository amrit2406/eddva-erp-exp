import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getSports, getParticipants, getTournaments, getTeams, getFixtures } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type {
  SportsRecordFormData,
  SportsRecordType,
  Sport,
  SportsParticipant,
  Tournament,
  TournamentTeam,
  Fixture,
} from '../../types/sports.types';

interface LogRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SportsRecordFormData) => Promise<void>;
  isLoading?: boolean;
  defaultSportId?: number;
}

const RECORD_TYPE_OPTIONS = [
  { value: 'personal_best', label: 'Personal Best' },
  { value: 'tournament_win', label: 'Tournament Win' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'school_record', label: 'School Record' },
];

export default function LogRecordModal({ isOpen, onClose, onSubmit, isLoading, defaultSportId }: LogRecordModalProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [participants, setParticipants] = useState<SportsParticipant[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [tournamentId, setTournamentId] = useState<number | ''>('');
  const [formData, setFormData] = useState<SportsRecordFormData>({
    participant_id: undefined,
    tournament_team_id: undefined,
    sport_id: defaultSportId ?? 0,
    record_type: 'personal_best',
    description: '',
    value: '',
    achieved_date: new Date().toISOString().slice(0, 10),
    source_fixture_id: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getSports().then(setSports).catch(() => setSports([]));
      getParticipants().then(setParticipants).catch(() => setParticipants([]));
      getTournaments().then(setTournaments).catch(() => setTournaments([]));
      setTournamentId('');
      setTeams([]);
      setFixtures([]);
      setFormData({
        participant_id: undefined,
        tournament_team_id: undefined,
        sport_id: defaultSportId ?? 0,
        record_type: 'personal_best',
        description: '',
        value: '',
        achieved_date: new Date().toISOString().slice(0, 10),
        source_fixture_id: undefined,
      });
      setError(null);
    }
  }, [isOpen, defaultSportId]);

  useEffect(() => {
    if (!tournamentId) {
      setTeams([]);
      setFixtures([]);
      return;
    }
    getTeams(tournamentId).then(setTeams).catch(() => setTeams([]));
    getFixtures(tournamentId).then(setFixtures).catch(() => setFixtures([]));
  }, [tournamentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sport_id) {
      setError('Select a sport.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to log record'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Sports Record" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sport *</label>
            <select
              value={formData.sport_id || ''}
              onChange={(e) => setFormData({ ...formData, sport_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select sport</option>
              {sports.map((s) => (
                <option key={s.sport_id} value={s.sport_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Record Type *</label>
            <Select
              value={formData.record_type}
              onChange={(e) => setFormData({ ...formData, record_type: e.target.value as SportsRecordType })}
              options={RECORD_TYPE_OPTIONS}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., 100m Sprint — 11.4s"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Value *</label>
            <input
              type="text"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g., 11.4s"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Achieved Date *</label>
            <input
              type="date"
              required
              value={formData.achieved_date}
              onChange={(e) => setFormData({ ...formData, achieved_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Participant (individual record)</label>
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

        <div className="border-t border-slate-200 pt-4 space-y-4">
          <p className="text-xs text-slate-500">Optionally link this record to a tournament to select a team or source fixture.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tournament</label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {tournaments.map((t) => (
                <option key={t.tournament_id} value={t.tournament_id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {tournamentId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Team (team record)</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Fixture</label>
                <select
                  value={formData.source_fixture_id ?? ''}
                  onChange={(e) => setFormData({ ...formData, source_fixture_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {fixtures.map((f) => (
                    <option key={f.fixture_id} value={f.fixture_id}>
                      {f.round}: {f.team_a?.team_name ?? f.team_a_id} vs {f.team_b?.team_name ?? f.team_b_id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Log Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

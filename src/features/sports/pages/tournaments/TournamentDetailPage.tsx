import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Users, Swords, Calendar, MapPin, BarChart3 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import {
  getTournament,
  createTeam,
  createFixture,
  recordFixtureResult,
  recordPlayerStat,
} from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import CreateTeamModal from '../../components/tournaments/CreateTeamModal';
import CreateFixtureModal from '../../components/tournaments/CreateFixtureModal';
import RecordResultModal from '../../components/tournaments/RecordResultModal';
import RecordPlayerStatModal from '../../components/tournaments/RecordPlayerStatModal';
import type {
  Tournament,
  Fixture,
  TeamFormData,
  FixtureFormData,
  RecordResultFormData,
  RecordPlayerStatFormData,
  FixtureStatus,
} from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

const STATUS_STYLE: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
};

const FIXTURE_STATUS_STYLE: Record<FixtureStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  postponed: 'bg-slate-100 text-slate-600',
  walkover: 'bg-purple-100 text-purple-700',
};

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [resultFixture, setResultFixture] = useState<Fixture | null>(null);
  const [statFixture, setStatFixture] = useState<Fixture | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTournament(id);
      setTournament(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load tournament'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam(data: TeamFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await createTeam(id, data);
      await load();
      setIsTeamModalOpen(false);
      toast.success('Team registered.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateFixture(data: FixtureFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await createFixture(id, data);
      await load();
      setIsFixtureModalOpen(false);
      toast.success('Fixture scheduled.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecordResult(data: RecordResultFormData) {
    if (!resultFixture) return;
    setIsSubmitting(true);
    try {
      await recordFixtureResult(resultFixture.fixture_id, data);
      await load();
      setResultFixture(null);
      toast.success('Result recorded.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecordStat(data: RecordPlayerStatFormData) {
    if (!statFixture) return;
    setIsSubmitting(true);
    try {
      const stat = await recordPlayerStat(statFixture.fixture_id, data);
      setStatFixture(null);
      toast.success(`Recorded ${stat.stat_value} ${stat.stat_type} for ${stat.participant?.name ?? 'participant'}.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8 text-slate-500">Tournament not found.</div>;
  }

  const teams = tournament.teams ?? [];
  const fixtures = tournament.fixtures ?? [];

  return (
    <div className="space-y-6">
      <Link to="/sports/tournaments" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Tournaments
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {tournament.name}
            <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_STYLE[tournament.status])}>
              {tournament.status}
            </span>
          </h1>
          <p className="text-slate-600 mt-1 capitalize">
            {tournament.sport?.name ?? `Sport #${tournament.sport_id}`} · {tournament.level.replace(/_/g, ' ')} · {tournament.format.replace(/_/g, ' ')}
          </p>
        </div>
        <Link to={`/sports/tournaments/${tournament.tournament_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Tournament
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Dates
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {new Date(tournament.start_date).toLocaleDateString()} – {new Date(tournament.end_date).toLocaleDateString()}
          </p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Venue
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{tournament.venue?.name ?? 'Not set'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Teams / Fixtures
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{teams.length} teams · {fixtures.length} fixtures</p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Teams
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsTeamModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Team
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Team</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">House</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Coach</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Members</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No teams registered yet.
                    </td>
                  </tr>
                ) : (
                  teams.map((t) => (
                    <tr key={t.tournament_team_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm font-medium text-slate-900">{t.team_name}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{t.house?.name ?? '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{t.coach?.name ?? '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{t.members?.length ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Swords className="h-5 w-5 text-blue-600" />
              Fixtures
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsFixtureModalOpen(true)} disabled={teams.length < 2}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Fixture
            </Button>
          </div>
          {teams.length < 2 && (
            <p className="text-xs text-slate-500 mb-3">Register at least 2 teams before scheduling fixtures.</p>
          )}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Round</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Match</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Scheduled</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Result</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fixtures.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No fixtures scheduled yet.
                    </td>
                  </tr>
                ) : (
                  fixtures.map((f) => (
                    <tr key={f.fixture_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{f.round}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {f.team_a?.team_name ?? `#${f.team_a_id}`} vs {f.team_b?.team_name ?? `#${f.team_b_id}`}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(f.scheduled_date).toLocaleString()}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {f.result ? (
                          <span>
                            {f.result.team_a_score} – {f.result.team_b_score}
                            {f.result.winner_team && (
                              <span className="text-xs text-green-600 ml-1">({f.result.winner_team.team_name} won)</span>
                            )}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', FIXTURE_STATUS_STYLE[f.status])}>
                          {f.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setResultFixture(f)}
                            className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            Record Result
                          </button>
                          <button
                            onClick={() => setStatFixture(f)}
                            className="text-xs px-2 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Stat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <CreateTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={handleCreateTeam}
        isLoading={isSubmitting}
      />
      <CreateFixtureModal
        isOpen={isFixtureModalOpen}
        onClose={() => setIsFixtureModalOpen(false)}
        teams={teams}
        onSubmit={handleCreateFixture}
        isLoading={isSubmitting}
      />
      <RecordResultModal
        isOpen={!!resultFixture}
        onClose={() => setResultFixture(null)}
        fixture={resultFixture}
        onSubmit={handleRecordResult}
        isLoading={isSubmitting}
      />
      <RecordPlayerStatModal
        isOpen={!!statFixture}
        onClose={() => setStatFixture(null)}
        fixture={statFixture}
        onSubmit={handleRecordStat}
        isLoading={isSubmitting}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Medal } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { useToast } from '../../../../hooks/useToast';
import { getTournaments, getTournamentAwards, issueAward } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import AwardTable from '../../components/records/AwardTable';
import IssueAwardModal from '../../components/records/IssueAwardModal';
import type { Tournament, SportsAward, IssueAwardFormData } from '../../types/sports.types';

export default function AwardsPage() {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState<number | ''>('');
  const [awards, setAwards] = useState<SportsAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getTournaments().then(setTournaments).catch(() => setTournaments([]));
  }, []);

  useEffect(() => {
    if (tournamentId) load(tournamentId);
    else setAwards([]);
  }, [tournamentId]);

  async function load(id: number) {
    try {
      setLoading(true);
      const data = await getTournamentAwards(id);
      setAwards(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load awards'));
    } finally {
      setLoading(false);
    }
  }

  async function handleIssueAward(data: IssueAwardFormData) {
    if (!tournamentId) return;
    setIsSubmitting(true);
    try {
      await issueAward(tournamentId, data);
      toast.success('Award issued.');
      setIsModalOpen(false);
      load(tournamentId);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Awards</h1>
          <p className="text-slate-600 mt-1">Medals, certificates, and MVP honors by tournament</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} disabled={!tournamentId}>
          <Plus className="h-4 w-4 mr-2" />
          Issue Award
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-4">
          <Select
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value ? Number(e.target.value) : '')}
            options={tournaments.map((t) => ({ value: String(t.tournament_id), label: t.name }))}
            placeholder="Select a tournament"
            className="w-72"
          />

          {!tournamentId ? (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
              <Medal className="h-8 w-8 text-slate-300" />
              Select a tournament to view its awards.
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <AwardTable awards={awards} />
          )}
        </div>
      </Card>

      <IssueAwardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tournamentId={tournamentId}
        onSubmit={handleIssueAward}
        isLoading={isSubmitting}
      />
    </div>
  );
}

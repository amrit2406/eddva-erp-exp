import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import TournamentTable from '../../components/tournaments/TournamentTable';
import { getTournaments } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { Tournament } from '../../types/sports.types';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    try {
      setLoading(true);
      const data = await getTournaments();
      setTournaments(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load tournaments'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tournaments</h1>
          <p className="text-slate-600 mt-1">Manage tournaments, teams, fixtures, and results</p>
        </div>
        <Link to="/sports/tournaments/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Tournament
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <TournamentTable tournaments={tournaments} />
        </Card>
      )}
    </div>
  );
}

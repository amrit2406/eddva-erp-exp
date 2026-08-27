import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import { useToast } from '../../../../hooks/useToast';
import { getHouseStandings } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { HouseStanding } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

const DEFAULT_YEAR = '2026-27';

export default function HouseStandingsPage() {
  const { toast } = useToast();
  const [standings, setStandings] = useState<HouseStanding[]>([]);
  const [academicYear, setAcademicYear] = useState(DEFAULT_YEAR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [academicYear]);

  async function load() {
    try {
      setLoading(true);
      const data = await getHouseStandings(academicYear);
      setStandings(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load standings'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/sports/houses" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Houses
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">House Standings</h1>
          <p className="text-slate-600 mt-1">Leaderboard ranked by total points</p>
        </div>
        <div className="w-full sm:w-48">
          <Input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Academic year e.g. 2026-27"
          />
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : standings.length === 0 ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">No standings for this academic year yet.</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {standings.map((standing) => (
            <Card
              key={standing.house_id}
              className={cn(
                'border-slate-200',
                standing.rank === 1 && 'border-amber-300 bg-amber-50'
              )}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 font-bold text-slate-700 flex-shrink-0">
                  {standing.rank === 1 ? <Trophy className="h-5 w-5 text-amber-500" /> : `#${standing.rank}`}
                </div>
                <span
                  className="h-6 w-6 rounded-full border border-slate-200 flex-shrink-0"
                  style={{ backgroundColor: standing.house?.color_code || '#e2e8f0' }}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{standing.house?.name ?? `House #${standing.house_id}`}</p>
                  {standing.house?.motto && <p className="text-xs text-slate-500">"{standing.house.motto}"</p>}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{standing.total_points}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

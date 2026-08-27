import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Swords } from 'lucide-react';
import type { Tournament, TournamentStatus } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface TournamentTableProps {
  tournaments: Tournament[];
  className?: string;
}

const STATUS_STYLE: Record<TournamentStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function TournamentTable({ tournaments, className }: TournamentTableProps) {
  const tournamentsArray = Array.isArray(tournaments) ? tournaments : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Sport</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Level / Format</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Dates</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Teams / Fixtures</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {tournamentsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No tournaments found. Create your first tournament.
              </td>
            </tr>
          ) : (
            tournamentsArray.map((t) => (
              <tr key={t.tournament_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link to={`/sports/tournaments/${t.tournament_id}`} className="flex items-center gap-2 hover:underline">
                    <Trophy className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{t.name}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{t.sport?.name ?? `#${t.sport_id}`}</td>
                <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                  {t.level.replace(/_/g, ' ')} · {t.format.replace(/_/g, ' ')}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(t.start_date).toLocaleDateString()} – {new Date(t.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {t._count?.teams ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5" /> {t._count?.fixtures ?? 0}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_STYLE[t.status])}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

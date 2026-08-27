import { Medal, Calendar } from 'lucide-react';
import type { SportsAward } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface AwardTableProps {
  awards: SportsAward[];
  className?: string;
}

export default function AwardTable({ awards, className }: AwardTableProps) {
  const awardsArray = Array.isArray(awards) ? awards : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Award</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Recipient</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Issued</th>
          </tr>
        </thead>
        <tbody>
          {awardsArray.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-slate-500">
                No awards issued yet.
              </td>
            </tr>
          ) : (
            awardsArray.map((a) => (
              <tr key={a.award_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Medal className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-slate-900">{a.award_type}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {a.participant?.name ?? a.tournament_team?.team_name ?? '—'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(a.issued_date).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

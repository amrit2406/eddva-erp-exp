import { Award, Calendar } from 'lucide-react';
import type { SportsRecord, SportsRecordType } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface RecordTableProps {
  records: SportsRecord[];
  className?: string;
}

const TYPE_LABEL: Record<SportsRecordType, string> = {
  personal_best: 'Personal Best',
  tournament_win: 'Tournament Win',
  milestone: 'Milestone',
  school_record: 'School Record',
};

const TYPE_STYLE: Record<SportsRecordType, string> = {
  personal_best: 'bg-blue-100 text-blue-700',
  tournament_win: 'bg-amber-100 text-amber-700',
  milestone: 'bg-purple-100 text-purple-700',
  school_record: 'bg-green-100 text-green-700',
};

export default function RecordTable({ records, className }: RecordTableProps) {
  const recordsArray = Array.isArray(records) ? records : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Value</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Holder</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Sport</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Achieved</th>
          </tr>
        </thead>
        <tbody>
          {recordsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No records found.
              </td>
            </tr>
          ) : (
            recordsArray.map((r) => (
              <tr key={r.record_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{r.description}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-slate-900">{r.value}</td>
                <td className="py-3 px-4">
                  <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', TYPE_STYLE[r.record_type])}>
                    {TYPE_LABEL[r.record_type] ?? r.record_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {r.participant?.name ?? r.tournament_team?.team_name ?? '—'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{r.sport?.name ?? `#${r.sport_id}`}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(r.achieved_date).toLocaleDateString()}
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

import { Link } from 'react-router-dom';
import { Edit, Trash2, Trophy } from 'lucide-react';
import type { Sport } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface SportTableProps {
  sports: Sport[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function SportTable({ sports, className, onDelete }: SportTableProps) {
  const sportsArray = Array.isArray(sports) ? sports : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sportsArray.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No sports found. Add your first sport.
              </td>
            </tr>
          ) : (
            sportsArray.map((sport) => (
              <tr key={sport.sport_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{sport.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      sport.category === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    )}
                  >
                    {sport.category === 'team' ? 'Team' : 'Individual'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-sm truncate">{sport.description || '—'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sports/catalog/${sport.sport_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(sport.sport_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

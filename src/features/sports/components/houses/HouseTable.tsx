import { Link } from 'react-router-dom';
import { Edit, Trash2, Users, Home } from 'lucide-react';
import type { House } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface HouseTableProps {
  houses: House[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function HouseTable({ houses, className, onDelete }: HouseTableProps) {
  const housesArray = Array.isArray(houses) ? houses : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">House</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">House Master</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Motto</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Members</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {housesArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No houses found. Add your first house.
              </td>
            </tr>
          ) : (
            housesArray.map((house) => (
              <tr key={house.house_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link to={`/sports/houses/${house.house_id}`} className="flex items-center gap-2 hover:underline">
                    <span
                      className="h-4 w-4 rounded-full border border-slate-200 flex-shrink-0"
                      style={{ backgroundColor: house.color_code || '#e2e8f0' }}
                    />
                    <span className="font-medium text-slate-900">{house.name}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {house.house_master ? house.house_master.name : <span className="text-slate-400">Unassigned</span>}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">{house.motto || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {house._count?.memberships ?? 0}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sports/houses/${house.house_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Home className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sports/houses/${house.house_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(house.house_id)}
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

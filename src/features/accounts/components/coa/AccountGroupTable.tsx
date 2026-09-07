import { Link } from 'react-router-dom';
import { Edit, Folder } from 'lucide-react';
import type { AccountGroup } from '../../types/coa.types';
import { cn } from '../../../../utils/cn';

interface AccountGroupTableProps {
  groups: AccountGroup[];
  className?: string;
}

const natureColors: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-700',
  LIABILITY: 'bg-red-100 text-red-700',
  INCOME: 'bg-green-100 text-green-700',
  EXPENSE: 'bg-orange-100 text-orange-700',
  EQUITY: 'bg-purple-100 text-purple-700',
};

export default function AccountGroupTable({ groups, className }: AccountGroupTableProps) {
  const groupsArray = Array.isArray(groups) ? groups : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Group Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nature</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Parent Group</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupsArray.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No account groups found. Add your first group.
              </td>
            </tr>
          ) : (
            groupsArray.map((group) => (
              <tr key={group.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{group.groupName}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      natureColors[group.nature] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {group.nature}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {group.parentGroup?.groupName ?? (group.parentGroupId ? `#${group.parentGroupId}` : '—')}
                </td>
                <td className="py-3 px-4">
                  <Link to={`/accounts/coa/groups/${group.id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

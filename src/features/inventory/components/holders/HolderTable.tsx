import { Link } from 'react-router-dom';
import { Edit, User, Phone } from 'lucide-react';
import type { InventoryHolder } from '../../types/holder.types';
import { cn } from '../../../../utils/cn';

interface HolderTableProps {
  holders: InventoryHolder[];
  className?: string;
}

const TYPE_STYLE: Record<string, string> = {
  staff: 'bg-blue-100 text-blue-700',
  student: 'bg-purple-100 text-purple-700',
  department: 'bg-amber-100 text-amber-700',
};

export default function HolderTable({ holders, className }: HolderTableProps) {
  const holdersArray = Array.isArray(holders) ? holders : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reference ID</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Contact</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdersArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No holders found. Add your first holder.
              </td>
            </tr>
          ) : (
            holdersArray.map((holder) => (
              <tr key={holder.holder_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link
                    to={`/inventory/holders/${holder.holder_id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{holder.name}</span>
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      TYPE_STYLE[holder.holder_type] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {holder.holder_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{holder.external_ref_id || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {holder.contact_phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {holder.contact_phone}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      holder.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {holder.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/holders/${holder.holder_id}/edit`}>
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

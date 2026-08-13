import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { UOM } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface UOMTableProps {
  uoms: UOM[];
  className?: string;
}

export default function UOMTable({ uoms, className }: UOMTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">UOM Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Created At</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {uoms.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No UOMs found. Create your first unit of measure.
              </td>
            </tr>
          ) : (
            uoms.map((uom) => (
              <tr key={uom.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{uom.name}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {uom.code}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {uom.createdAt ? new Date(uom.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/uom/${uom.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/uom/${uom.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
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

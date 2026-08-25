import { Edit, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { BookCopy } from '../../types/library.types';
import { cn } from '../../../../utils/cn';

interface CopyTableProps {
  copies: BookCopy[];
  className?: string;
  onEdit?: (copy: BookCopy) => void;
  onDelete?: (copyId: number) => void;
}

const conditionColors = {
  new: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-orange-100 text-orange-800',
  damaged: 'bg-red-100 text-red-800',
};

const statusColors = {
  available: 'bg-green-50 text-green-700 border-green-200',
  issued: 'bg-blue-50 text-blue-700 border-blue-200',
  reserved: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  lost: 'bg-red-50 text-red-700 border-red-200',
  under_repair: 'bg-orange-50 text-orange-700 border-orange-200',
  withdrawn: 'bg-gray-50 text-gray-700 border-gray-200',
};

const statusIcons = {
  available: CheckCircle,
  issued: Clock,
  reserved: Clock,
  lost: AlertTriangle,
  under_repair: AlertTriangle,
  withdrawn: AlertTriangle,
};

export default function CopyTable({ copies, className, onEdit, onDelete }: CopyTableProps) {
  const copiesArray = Array.isArray(copies) ? copies : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Barcode</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Condition</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Acquired</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden xl:table-cell">Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {copiesArray.length === 0 ? (
            <tr key="no-copies">
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No copies found. Add your first copy to this book.
              </td>
            </tr>
          ) : (
            copiesArray.map((copy) => {
              const StatusIcon = statusIcons[copy.status];
              return (
                <tr key={copy.copy_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm text-slate-900">{copy.barcode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-slate-700">{copy.rack_location}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', conditionColors[copy.condition])}>
                      {copy.condition.charAt(0).toUpperCase() + copy.condition.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                    {copy.acquired_date ? new Date(copy.acquired_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 hidden xl:table-cell">
                    ₹{Number(copy.price).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border', statusColors[copy.status])}>
                      <StatusIcon className="h-3 w-3" />
                      {copy.status.charAt(0).toUpperCase() + copy.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit?.(copy)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete?.(copy.copy_id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

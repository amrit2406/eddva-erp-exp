import { Link } from 'react-router-dom';
import { Eye, Package, MapPin } from 'lucide-react';
import type { InventoryStockAdjustment } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

interface AdjustmentTableProps {
  adjustments: InventoryStockAdjustment[];
  className?: string;
}

const REASON_STYLE: Record<string, string> = {
  damaged: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
  lost: 'bg-orange-100 text-orange-700',
  audit_correction: 'bg-blue-100 text-blue-700',
};

export default function AdjustmentTable({ adjustments, className }: AdjustmentTableProps) {
  const adjustmentsArray = Array.isArray(adjustments) ? adjustments : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Qty Change</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reason</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {adjustmentsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No adjustments found.
              </td>
            </tr>
          ) : (
            adjustmentsArray.map((a) => (
              <tr key={a.adjustment_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{a.item?.name ?? `#${a.item_id}`}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {a.location?.name ?? `#${a.location_id}`}
                  </span>
                </td>
                <td className={cn('py-3 px-4 text-sm font-medium', a.quantity_delta > 0 ? 'text-green-600' : 'text-red-600')}>
                  {a.quantity_delta > 0 ? `+${a.quantity_delta}` : a.quantity_delta}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      REASON_STYLE[a.reason] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {a.reason.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/stock/adjustments/${a.adjustment_id}`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                      <Eye className="h-4 w-4" />
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

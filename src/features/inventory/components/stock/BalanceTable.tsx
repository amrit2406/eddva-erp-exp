import { Package, MapPin } from 'lucide-react';
import type { InventoryStockBalance } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

interface BalanceTableProps {
  balances: InventoryStockBalance[];
  className?: string;
}

export default function BalanceTable({ balances, className }: BalanceTableProps) {
  const balancesArray = Array.isArray(balances) ? balances : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Quantity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reorder Level</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {balancesArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No stock balances found.
              </td>
            </tr>
          ) : (
            balancesArray.map((b) => {
              const isLow = b.item ? b.quantity <= b.item.reorder_level : false;
              return (
                <tr key={`${b.item_id}-${b.location_id}`} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{b.item?.name ?? `#${b.item_id}`}</span>
                      {b.item && <span className="text-xs text-slate-500 font-mono">{b.item.item_code}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {b.location?.name ?? `#${b.location_id}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">
                    {b.quantity} {b.item?.unit_of_measure ?? ''}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{b.item?.reorder_level ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      )}
                    >
                      {isLow ? 'Low Stock' : 'OK'}
                    </span>
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

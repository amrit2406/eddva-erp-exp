import { Package, MapPin } from 'lucide-react';
import type { InventoryStockLedgerEntry } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

interface LedgerTableProps {
  entries: InventoryStockLedgerEntry[];
  className?: string;
}

const TXN_STYLE: Record<string, string> = {
  purchase_in: 'bg-green-100 text-green-700',
  transfer_in: 'bg-green-100 text-green-700',
  adjustment_in: 'bg-green-100 text-green-700',
  return_in: 'bg-green-100 text-green-700',
  transfer_out: 'bg-red-100 text-red-700',
  adjustment_out: 'bg-red-100 text-red-700',
  issue_out: 'bg-red-100 text-red-700',
};

const IS_INBOUND = new Set(['purchase_in', 'transfer_in', 'adjustment_in', 'return_in']);

export default function LedgerTable({ entries, className }: LedgerTableProps) {
  const entriesArray = Array.isArray(entries) ? entries : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Qty</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Balance After</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reference</th>
          </tr>
        </thead>
        <tbody>
          {entriesArray.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No ledger entries found.
              </td>
            </tr>
          ) : (
            entriesArray.map((e) => (
              <tr key={e.ledger_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(e.created_at).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{e.item?.name ?? `#${e.item_id}`}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {e.location?.name ?? `#${e.location_id}`}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      TXN_STYLE[e.transaction_type] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {e.transaction_type.replace('_', ' ')}
                  </span>
                </td>
                <td className={cn('py-3 px-4 text-sm font-medium', IS_INBOUND.has(e.transaction_type) ? 'text-green-600' : 'text-red-600')}>
                  {IS_INBOUND.has(e.transaction_type) ? '+' : '-'}
                  {e.quantity}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{e.balance_after}</td>
                <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                  {e.reference_type} #{e.reference_id}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

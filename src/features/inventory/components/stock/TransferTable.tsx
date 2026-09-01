import { Link } from 'react-router-dom';
import { Eye, Package, MapPin, ArrowRight } from 'lucide-react';
import type { InventoryStockTransfer } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

interface TransferTableProps {
  transfers: InventoryStockTransfer[];
  className?: string;
}

export default function TransferTable({ transfers, className }: TransferTableProps) {
  const transfersArray = Array.isArray(transfers) ? transfers : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">From → To</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Qty</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfersArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No transfers found.
              </td>
            </tr>
          ) : (
            transfersArray.map((t) => (
              <tr key={t.transfer_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(t.transfer_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{t.item?.name ?? `#${t.item_id}`}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {t.from_location?.name ?? `#${t.from_location_id}`}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    {t.to_location?.name ?? `#${t.to_location_id}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{t.quantity}</td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/stock/transfers/${t.transfer_id}`}>
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

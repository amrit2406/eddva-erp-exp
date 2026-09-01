import { Link } from 'react-router-dom';
import { Eye, Package, Truck, MapPin } from 'lucide-react';
import type { InventoryStockPurchase } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

interface PurchaseTableProps {
  purchases: InventoryStockPurchase[];
  className?: string;
}

export default function PurchaseTable({ purchases, className }: PurchaseTableProps) {
  const purchasesArray = Array.isArray(purchases) ? purchases : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Qty</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Unit Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Total</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchasesArray.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                No purchases found.
              </td>
            </tr>
          ) : (
            purchasesArray.map((p) => (
              <tr key={p.purchase_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(p.purchase_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{p.item?.name ?? `#${p.item_id}`}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-slate-400" />
                    {p.vendor?.name ?? `#${p.vendor_id}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {p.location?.name ?? `#${p.location_id}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{p.quantity}</td>
                <td className="py-3 px-4 text-sm text-slate-600">₹{p.unit_price}</td>
                <td className="py-3 px-4 text-sm font-medium text-slate-900">₹{p.total_amount}</td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/stock/purchases/${p.purchase_id}`}>
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

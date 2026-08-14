import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, ShoppingCart, Calendar, Building2 } from 'lucide-react';
import type { PurchaseOrder } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function PurchaseOrderTable({ purchaseOrders, className, onDelete }: PurchaseOrderTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">PO Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">PO Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Expected Delivery</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No purchase orders found. Create your first purchase order.
              </td>
            </tr>
          ) : (
            purchaseOrders.map((po) => (
              <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">PO-{po.id.slice(0, 8)}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {po.vendor?.vendorName || '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {po.poDate ? new Date(po.poDate).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/purchase-orders/${po.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/purchase-orders/${po.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(po.id)}
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

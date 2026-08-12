import { Link } from 'react-router-dom';
import { Eye, Edit, Calendar, DollarSign } from 'lucide-react';
import { mockPurchaseOrders } from '../../mock/purchase.mock';
import { PURCHASE_ORDER_STATUS_COLORS } from '../../constants/purchase.constants';
import { cn } from '../../../../utils/cn';

interface PurchaseOrderTableProps {
  className?: string;
}

export default function PurchaseOrderTable({ className }: PurchaseOrderTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">PO Number</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Vendor</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Date</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Expected Delivery</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Amount</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockPurchaseOrders.map((po) => (
            <tr key={po.poId} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 sm:px-4">
                <div className="font-medium text-slate-900 text-xs sm:text-sm font-mono">{po.poNumber}</div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="font-medium text-slate-900 text-xs sm:text-sm">{po.vendorName}</div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(po.poDate).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : '-'}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{po.grandTotal.toLocaleString()}</span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', PURCHASE_ORDER_STATUS_COLORS[po.status])}>
                  {po.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link to={`/sales-purchase/purchase-orders/${po.poId}`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link to={`/sales-purchase/purchase-orders/${po.poId}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

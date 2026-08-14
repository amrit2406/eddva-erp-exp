import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Package, Calendar, ShoppingCart } from 'lucide-react';
import type { GRN } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface GRNTableProps {
  grns: GRN[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function GRNTable({ grns, className, onDelete }: GRNTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">GRN Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Purchase Order</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">GRN Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Warehouse</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {grns.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No GRNs found. Create your first GRN.
              </td>
            </tr>
          ) : (
            grns.map((grn) => (
              <tr key={grn.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">GRN-{grn.id.slice(0, 8)}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3 text-slate-400" />
                    PO-{grn.purchaseOrderId?.slice(0, 8) || '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {grn.grnDate ? new Date(grn.grnDate).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {grn.warehouse?.name || '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    grn.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' :
                    grn.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    grn.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  )}>
                    {grn.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/grn/${grn.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/grn/${grn.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(grn.id)}
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

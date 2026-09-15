import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, IndianRupee } from 'lucide-react';
import type { Item } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface ItemTableProps {
  items: Item[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function ItemTable({ items, className, onDelete }: ItemTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">UOM</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Purchase Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Sales Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No items found. Create your first item.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.item_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{item.item_code}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{item.item_name}</div>
                  {item.hsn_sac_code && (
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-slate-400" />{item.hsn_sac_code}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {item.category?.name || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {item.uom?.symbol || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {Number(item.purchase_price || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {Number(item.sales_price || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/items/${item.item_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/items/${item.item_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(item.item_id)}
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

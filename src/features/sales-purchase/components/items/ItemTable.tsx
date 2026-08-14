import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, IndianRupee } from 'lucide-react';
import type { Item } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface ItemTableProps {
  items: Item[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function ItemTable({ items, className, onDelete }: ItemTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">UOM</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Quantity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Purchase Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Sales Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                No items found. Create your first item.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{item.itemCode}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{item.itemName}</div>
                  <div className="text-xs text-slate-500">
                    <IndianRupee className="h-3 w-3 text-slate-400" />{item.hsnSacCode}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {item.category?.categoryName || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {item.uom?.code || '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    item.quantity > 10 ? 'bg-green-100 text-green-800' : 
                    item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  )}>
                    {item.quantity}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {Number(item.purchasePrice || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {Number(item.salesPrice || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/items/${item.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/items/${item.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(item.id)}
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

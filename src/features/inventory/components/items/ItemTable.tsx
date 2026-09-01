import { Link } from 'react-router-dom';
import { Edit, Package, Folder } from 'lucide-react';
import type { InventoryItem } from '../../types/item.types';
import { cn } from '../../../../utils/cn';

interface ItemTableProps {
  items: InventoryItem[];
  className?: string;
}

export default function ItemTable({ items, className }: ItemTableProps) {
  const itemsArray = Array.isArray(items) ? items : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">UoM</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reorder Level</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {itemsArray.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                No items found. Add your first item.
              </td>
            </tr>
          ) : (
            itemsArray.map((item) => (
              <tr key={item.item_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-600 font-mono">{item.item_code}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/inventory/items/${item.item_id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {item.category ? (
                    <span className="inline-flex items-center gap-1">
                      <Folder className="h-3.5 w-3.5 text-slate-400" />
                      {item.category.name}
                    </span>
                  ) : (
                    `#${item.category_id}`
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      item.item_type === 'asset' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {item.item_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{item.unit_of_measure}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{item.reorder_level}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/items/${item.item_id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
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

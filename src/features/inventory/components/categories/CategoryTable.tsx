import { Link } from 'react-router-dom';
import { Edit, Tag, Package, FolderTree } from 'lucide-react';
import type { InventoryCategory } from '../../types/category.types';
import { cn } from '../../../../utils/cn';

interface CategoryTableProps {
  categories: InventoryCategory[];
  className?: string;
}

export default function CategoryTable({ categories, className }: CategoryTableProps) {
  const categoriesArray = Array.isArray(categories) ? categories : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Parent Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Items</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Sub-categories</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categoriesArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No categories found. Add your first category.
              </td>
            </tr>
          ) : (
            categoriesArray.map((category) => (
              <tr key={category.category_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{category.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {category.parent ? (
                    <span className="inline-flex items-center gap-1">
                      <FolderTree className="h-3.5 w-3.5 text-slate-400" />
                      {category.parent.name}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      category.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {category.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    {category._count?.items ?? 0}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <FolderTree className="h-3.5 w-3.5 text-slate-400" />
                    {category._count?.children ?? 0}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/categories/${category.category_id}/edit`}>
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

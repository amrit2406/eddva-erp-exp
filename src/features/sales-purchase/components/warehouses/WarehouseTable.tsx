import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Star } from 'lucide-react';
import type { Warehouse } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  className?: string;
}

export default function WarehouseTable({ warehouses, className }: WarehouseTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Warehouse Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Address</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Default</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Created At</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No warehouses found. Create your first warehouse.
              </td>
            </tr>
          ) : (
            warehouses.map((warehouse) => (
              <tr key={warehouse.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-slate-900">{warehouse.name}</div>
                    {warehouse.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{warehouse.address}</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {warehouse.isDefault ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      No
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/warehouses/${warehouse.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/warehouses/${warehouse.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
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

import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Building2, MapPin } from 'lucide-react';
import type { Vendor } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface VendorTableProps {
  vendors: Vendor[];
  className?: string;
}

export default function VendorTable({ vendors, className }: VendorTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">GSTIN</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">City</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Credit Limit</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No vendors found. Create your first vendor.
              </td>
            </tr>
          ) : (
            vendors.map((vendor) => (
              <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">{vendor.vendorName}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{vendor.gstin || '-'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {vendor.city || '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {vendor.creditLimit ? `₹${vendor.creditLimit.toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    vendor.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 
                    'bg-slate-100 text-slate-800'
                  )}>
                    {vendor.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/vendors/${vendor.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/vendors/${vendor.id}/edit`}>
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

import { Link } from 'react-router-dom';
import { Edit, Truck, Phone, Mail } from 'lucide-react';
import type { InventoryVendor } from '../../types/vendor.types';
import { cn } from '../../../../utils/cn';

interface VendorTableProps {
  vendors: InventoryVendor[];
  className?: string;
}

export default function VendorTable({ vendors, className }: VendorTableProps) {
  const vendorsArray = Array.isArray(vendors) ? vendors : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Address</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendorsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No vendors found. Add your first vendor.
              </td>
            </tr>
          ) : (
            vendorsArray.map((vendor) => (
              <tr key={vendor.vendor_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{vendor.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {vendor.contact_phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {vendor.contact_phone}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {vendor.email ? (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {vendor.email}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell max-w-xs truncate">
                  {vendor.address || '—'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {vendor.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/vendors/${vendor.vendor_id}/edit`}>
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

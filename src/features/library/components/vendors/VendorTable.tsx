import { Edit, Trash2, Building2, Phone, Mail } from 'lucide-react';
import type { BookVendor } from '../../types/library.types';
import { cn } from '../../../../utils/cn';

interface VendorTableProps {
  vendors: BookVendor[];
  className?: string;
  onEdit?: (vendor: BookVendor) => void;
  onDelete?: (vendorId: number) => void;
}

export default function VendorTable({ vendors, className, onEdit, onDelete }: VendorTableProps) {
  const vendorsArray = Array.isArray(vendors) ? vendors : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Contact Person</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Phone</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden xl:table-cell">Last Purchase Price</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendorsArray.length === 0 ? (
            <tr key="no-vendors">
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No vendors found. Add your first vendor to this book.
              </td>
            </tr>
          ) : (
            vendorsArray.map((vendor) => (
              <tr key={vendor.book_vendor_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">{vendor.vendor_name}</div>
                      <div className="text-sm text-slate-500">{vendor.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-slate-700">{vendor.contact_person}</div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Phone className="h-3 w-3" />
                    {vendor.phone}
                  </div>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Mail className="h-3 w-3" />
                    {vendor.email}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden xl:table-cell">
                  ₹{Number(vendor.last_purchase_price).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(vendor)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(vendor.book_vendor_id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                      title="Delete"
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

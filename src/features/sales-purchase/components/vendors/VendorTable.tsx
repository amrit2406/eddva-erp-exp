import { Link } from 'react-router-dom';
import { Eye, Edit, Phone, MapPin } from 'lucide-react';
import { mockVendors } from '../../mock/vendors.mock';
import { VENDOR_STATUS_COLORS } from '../../constants/vendor.constants';
import { cn } from '../../../../utils/cn';

interface VendorTableProps {
  className?: string;
}

export default function VendorTable({ className }: VendorTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Vendor</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Code</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">GSTIN</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Location</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Payment Terms</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Credit Limit</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockVendors.map((vendor) => (
            <tr key={vendor.vendorId} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 sm:px-4">
                <div className="font-medium text-slate-900 text-xs sm:text-sm">{vendor.vendorName}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />
                  <span>+91 98765 43210</span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 font-mono">{vendor.vendorCode}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell font-mono">{vendor.gstin || '-'}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{vendor.city || '-'}</span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{vendor.paymentTermName || '-'}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                {vendor.creditLimit ? `₹${vendor.creditLimit.toLocaleString()}` : '-'}
              </td>
              <td className="py-3 px-2 sm:px-4">
                <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', VENDOR_STATUS_COLORS[vendor.status])}>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link to={`/sales-purchase/vendors/${vendor.vendorId}`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link to={`/sales-purchase/vendors/${vendor.vendorId}/edit`}>
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

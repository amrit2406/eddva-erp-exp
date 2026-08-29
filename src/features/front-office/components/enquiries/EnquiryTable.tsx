import { Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import type { FrontOfficeEnquiry, FrontOfficeEnquiryStatus } from '../../types/enquiryRecord.types';
import { cn } from '../../../../utils/cn';

interface EnquiryTableProps {
  enquiries: FrontOfficeEnquiry[];
  className?: string;
}

const STATUS_STYLE: Record<FrontOfficeEnquiryStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-600',
};

export default function EnquiryTable({ enquiries, className }: EnquiryTableProps) {
  const enquiriesArray = Array.isArray(enquiries) ? enquiries : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Enquirer</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Source</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Category</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Assigned To</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Created</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enquiriesArray.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-slate-500">
                No enquiries found.
              </td>
            </tr>
          ) : (
            enquiriesArray.map((enquiry) => (
              <tr key={enquiry.enquiry_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2 sm:px-4">
                  <Link to={`/front-office/enquiries/${enquiry.enquiry_id}`} className="text-sm font-medium text-slate-900 hover:underline">
                    {enquiry.enquirer_name}
                  </Link>
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">{enquiry.phone || '—'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{enquiry.email || '—'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 capitalize hidden lg:table-cell">{enquiry.source.replace('_', ' ')}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 capitalize hidden sm:table-cell">{enquiry.category}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{enquiry.assignee?.name || '—'}</td>
                <td className="py-3 px-2 sm:px-4">
                  <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_STYLE[enquiry.status])}>
                    {enquiry.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                  {new Date(enquiry.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link to={`/front-office/enquiries/${enquiry.enquiry_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/front-office/enquiries/${enquiry.enquiry_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
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

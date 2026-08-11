import { Link } from 'react-router-dom';
import { Eye, Edit, Clock } from 'lucide-react';
import { mockEnquiries } from '../../mock/enquiries.mock';
import StatusBadge from '../common/StatusBadge';
import { cn } from '../../../../utils/cn';

interface EnquiryTableProps {
  className?: string;
}

export default function EnquiryTable({ className }: EnquiryTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Enquiry #</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Enquirer</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Source</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Category</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Assigned To</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Created Date</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Next Follow-up</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockEnquiries.map((enquiry) => (
            <tr key={enquiry.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900 font-medium">{enquiry.enquiryNumber}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">{enquiry.enquirerName}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">{enquiry.phone}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{enquiry.email || '-'}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 capitalize hidden lg:table-cell">{enquiry.source.replace('_', ' ')}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 capitalize hidden sm:table-cell">{enquiry.category}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{enquiry.assignedToName || '-'}</td>
              <td className="py-3 px-2 sm:px-4">
                <StatusBadge status={enquiry.status} variant="enquiry" />
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                {new Date(enquiry.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">-</td>
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link to={`/front-office/enquiries/${enquiry.id}`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link to={`/front-office/enquiries/${enquiry.id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                  <button className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600" title="Add Follow-up">
                    <Clock className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

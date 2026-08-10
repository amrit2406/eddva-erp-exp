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
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Enquiry #</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Enquirer</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Source</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Assigned To</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Next Follow-up</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockEnquiries.map((enquiry) => (
            <tr key={enquiry.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">{enquiry.enquiryNumber}</td>
              <td className="py-3 px-4 text-sm text-slate-900">{enquiry.enquirerName}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{enquiry.phone}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{enquiry.email || '-'}</td>
              <td className="py-3 px-4 text-sm text-slate-600 capitalize">{enquiry.source.replace('_', ' ')}</td>
              <td className="py-3 px-4 text-sm text-slate-600 capitalize">{enquiry.category}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{enquiry.assignedToName || '-'}</td>
              <td className="py-3 px-4">
                <StatusBadge status={enquiry.status} variant="enquiry" />
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">
                {new Date(enquiry.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">-</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
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

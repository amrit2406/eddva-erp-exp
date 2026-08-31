import { Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeComplaint } from '../../types/complaintRecord.types';

interface ComplaintTableProps {
  complaints: FrontOfficeComplaint[];
  className?: string;
}

export default function ComplaintTable({ complaints, className }: ComplaintTableProps) {
  const rows = Array.isArray(complaints) ? complaints : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Complainant</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Phone</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Category</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Priority</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Assigned To</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Created</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                No complaints found.
              </td>
            </tr>
          ) : (
            rows.map((complaint) => (
              <tr key={complaint.complaint_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2 sm:px-4">
                  <Link
                    to={`/front-office/complaints/${complaint.complaint_id}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    {complaint.complainant_name}
                  </Link>
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{complaint.phone || '—'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 capitalize hidden sm:table-cell">{complaint.category}</td>
                <td className="py-3 px-2 sm:px-4">
                  <PriorityBadge priority={complaint.priority} />
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                  {complaint.assignee?.name || '—'}
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <StatusBadge status={complaint.status} variant="complaint" />
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                  {new Date(complaint.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link to={`/front-office/complaints/${complaint.complaint_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/front-office/complaints/${complaint.complaint_id}/edit`}>
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

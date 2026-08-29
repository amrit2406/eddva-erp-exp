import { Link } from 'react-router-dom';
import { Eye, Edit, User } from 'lucide-react';
import type { FrontOfficeVisitor } from '../../types/visitorRecord.types';
import { cn } from '../../../../utils/cn';

interface VisitorTableProps {
  visitors: FrontOfficeVisitor[];
  className?: string;
}

export default function VisitorTable({ visitors, className }: VisitorTableProps) {
  const visitorsArray = Array.isArray(visitors) ? visitors : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700">Visitor</th>
            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Organization</th>
            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">ID Proof</th>
            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visitorsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No visitors found.
              </td>
            </tr>
          ) : (
            visitorsArray.map((visitor) => (
              <tr key={visitor.visitor_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link to={`/front-office/visitors/${visitor.visitor_id}`} className="flex items-center gap-2 hover:underline">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {visitor.photo_url ? (
                        <img src={visitor.photo_url} alt={visitor.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                    <span className="font-medium text-slate-900 text-sm">{visitor.full_name}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{visitor.phone || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">{visitor.email || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">{visitor.organization || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden sm:table-cell">
                  {visitor.id_proof_type ? (
                    <span>
                      {visitor.id_proof_type}
                      {visitor.id_proof_number && <span className="text-slate-400"> · {visitor.id_proof_number}</span>}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link to={`/front-office/visitors/${visitor.visitor_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/front-office/visitors/${visitor.visitor_id}/edit`}>
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

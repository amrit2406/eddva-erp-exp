import { Link } from 'react-router-dom';
import { Edit, Eye, User, Badge, Calendar } from 'lucide-react';
import type { Member } from '../../types/library.types';
import { cn } from '../../../../utils/cn';
import { ROUTES } from '../../../../constants/routes';

interface MemberTableProps {
  members: Member[];
  className?: string;
}

export default function MemberTable({ members, className }: MemberTableProps) {
  const membersArray = Array.isArray(members) ? members : [];
  
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">External Ref ID</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Member Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Joined Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {membersArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No members found. Create your first member.
              </td>
            </tr>
          ) : (
            membersArray.map((member) => (
              <tr key={member.member_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Badge className="h-4 w-4 text-slate-400" />
                    <div className="font-mono text-sm text-slate-700">
                      {member.external_ref_id}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">
                      {member.name}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="capitalize">{member.member_type}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{new Date(member.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={ROUTES.LIBRARY_MEMBERS_EDIT.replace(':id', member.member_id.toString())}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={ROUTES.LIBRARY_MEMBERS_DETAILS.replace(':id', member.member_id.toString())}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View Details">
                        <Eye className="h-4 w-4" />
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
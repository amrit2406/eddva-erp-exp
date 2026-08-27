import { Link } from 'react-router-dom';
import { Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import type { SportsStaff } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface StaffTableProps {
  staff: SportsStaff[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function StaffTable({ staff, className, onDelete }: StaffTableProps) {
  const staffArray = Array.isArray(staff) ? staff : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No staff found. Add your first staff member.
              </td>
            </tr>
          ) : (
            staffArray.map((member) => (
              <tr key={member.staff_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{member.name}</div>
                      {member.external_ref_id && (
                        <div className="text-xs text-slate-500">{member.external_ref_id}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {member.email ? (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {member.email}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {member.phone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {member.phone}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sports/staff/${member.staff_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(member.staff_id)}
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

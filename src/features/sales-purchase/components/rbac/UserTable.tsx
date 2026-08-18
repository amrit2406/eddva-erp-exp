import { Link } from 'react-router-dom';
import { Edit, Trash2, User as UserIcon, Mail, Shield } from 'lucide-react';
import type { User } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface UserTableProps {
  users: User[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function UserTable({ users, className, onDelete }: UserTableProps) {
  const usersArray = Array.isArray(users) ? users : [];
  
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Role</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No users found. Create your first user.
              </td>
            </tr>
          ) : (
            usersArray.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">{user.name}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    {user.email}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-slate-400" />
                    {user.role?.roleName || '-'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    user.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 
                    'bg-slate-100 text-slate-800'
                  )}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/users/${user.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(user.id)}
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
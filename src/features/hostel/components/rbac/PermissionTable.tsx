import { Link } from 'react-router-dom';
import { Edit, Trash2, Lock, Tag } from 'lucide-react';
import type { HostelPermissionEntry } from '../../types/role.types';
import { cn } from '../../../../utils/cn';

interface PermissionTableProps {
  permissions: HostelPermissionEntry[];
  className?: string;
  onDelete?: (permission: HostelPermissionEntry) => void;
}

export default function PermissionTable({ permissions, className, onDelete }: PermissionTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Resource</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No permissions found. Create your first permission.
              </td>
            </tr>
          ) : (
            permissions.map((permission) => (
              <tr key={permission.permission_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900 font-mono text-sm">{permission.resource}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{permission.action}</td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">{permission.name}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    {permission.category}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        permission.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {permission.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {permission.is_system && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        System
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/hostel/permissions/${permission.permission_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(permission)}
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

import { Link } from 'react-router-dom';
import { Edit, Trash2, Shield, Users } from 'lucide-react';
import type { Role } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface RoleTableProps {
  roles: Role[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function RoleTable({ roles, className, onDelete }: RoleTableProps) {
  const rolesArray = Array.isArray(roles) ? roles : [];
  
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Permissions</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rolesArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No roles found. Create your first role.
              </td>
            </tr>
          ) : (
            rolesArray.map((role) => (
              <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">{role.roleName}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                  {role.description || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    {role.rolePermissions.length} permissions
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    role.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    role.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 
                    'bg-slate-100 text-slate-800'
                  )}>
                    {role.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/roles/${role.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(role.id)}
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
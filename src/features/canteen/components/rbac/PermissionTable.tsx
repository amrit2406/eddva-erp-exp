import { Link } from 'react-router-dom';
import { Edit, Trash2, Key, Database } from 'lucide-react';
import type { Permission } from '../../types/canteen.types';
import { cn } from '../../../../utils/cn';

interface PermissionTableProps {
  permissions: Permission[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function PermissionTable({ permissions, className, onDelete }: PermissionTableProps) {
  const permissionsArray = Array.isArray(permissions) ? permissions : [];
  
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Permission Key</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissionsArray.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No permissions found. Create your first permission.
              </td>
            </tr>
          ) : (
            permissionsArray.map((permission) => (
              <tr key={permission.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900 font-mono text-sm">
                      {permission.key}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                  {permission.description}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3 text-slate-400" />
                    Custom
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/canteen/permissions/${permission.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(permission.id)}
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

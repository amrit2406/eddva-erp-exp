import { Check, X } from 'lucide-react';
import type { Permission } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface PermissionsToggleProps {
  permissions: Permission[];
  selectedPermissionIds: string[];
  onToggle: (permissionId: string) => void;
  className?: string;
}

export default function PermissionsToggle({ 
  permissions, 
  selectedPermissionIds, 
  onToggle,
  className 
}: PermissionsToggleProps) {
  // Group permissions by their key prefix (e.g., sales., purchase.)
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const prefix = permission.permissionKey.split('.')[0];
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className={cn('space-y-4', className)}>
      {Object.entries(groupedPermissions).map(([prefix, groupPermissions]) => (
        <div key={prefix} className="border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 capitalize">
            {prefix} Permissions
          </h3>
          <div className="space-y-2">
            {groupPermissions.map((permission) => {
              const isSelected = selectedPermissionIds.includes(permission.id);
              return (
                <div
                  key={permission.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  )}
                  onClick={() => onToggle(permission.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 text-sm">
                      {permission.permissionKey}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {permission.description}
                    </div>
                  </div>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-blue-500' : 'bg-slate-200'
                  )}>
                    {isSelected ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <X className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
import { Check, X } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { InventoryPermissionResourceGroup, InventoryRolePermissionRule } from '../../types/role.types';

interface ResourcePermissionsToggleProps {
  resources: InventoryPermissionResourceGroup[];
  selectedPermissions: InventoryRolePermissionRule[];
  onChange: (permissions: InventoryRolePermissionRule[]) => void;
  className?: string;
}

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export default function ResourcePermissionsToggle({
  resources,
  selectedPermissions,
  onChange,
  className,
}: ResourcePermissionsToggleProps) {
  const getSelectedActions = (resource: string): string[] =>
    selectedPermissions.find((p) => p.resource === resource)?.actions ?? [];

  const toggleAction = (resource: string, action: string) => {
    const current = getSelectedActions(resource);
    const updated = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
    const next = selectedPermissions.filter((p) => p.resource !== resource);
    if (updated.length > 0) {
      next.push({ resource, actions: updated });
    }
    onChange(next);
  };

  const toggleAllForResource = (resourceItem: InventoryPermissionResourceGroup) => {
    const current = getSelectedActions(resourceItem.resource);
    const allSelected = resourceItem.available_actions.every((a) => current.includes(a));
    const next = selectedPermissions.filter((p) => p.resource !== resourceItem.resource);
    if (!allSelected) {
      next.push({ resource: resourceItem.resource, actions: [...resourceItem.available_actions] });
    }
    onChange(next);
  };

  const totalSelected = selectedPermissions.reduce((sum, p) => sum + p.actions.length, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {resources.map((resourceItem) => {
        const selectedActions = getSelectedActions(resourceItem.resource);
        const allSelected = resourceItem.available_actions.every((a) => selectedActions.includes(a));

        return (
          <div key={resourceItem.resource} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{resourceItem.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{resourceItem.resource}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleAllForResource(resourceItem)}
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded transition-colors',
                  allSelected ? 'text-red-600 hover:bg-red-50' : 'text-[#008BE9] hover:bg-[#008BE9]/10'
                )}
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resourceItem.available_actions.map((action) => {
                const isSelected = selectedActions.includes(action);
                const permissionDetail = resourceItem.permissions.find((p) => p.action === action);

                return (
                  <button
                    key={action}
                    type="button"
                    title={permissionDetail?.description ?? undefined}
                    onClick={() => toggleAction(resourceItem.resource, action)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-[#008BE9]/10 border-[#008BE9]/30 text-[#002C6D]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 text-slate-300" />}
                    {formatAction(action)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-500">{totalSelected} permission(s) selected</p>
    </div>
  );
}

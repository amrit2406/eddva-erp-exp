import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import PermissionsToggle from './PermissionsToggle';
import type { RoleFormData, Permission, Role } from '../../types/sales-purchase.types';

interface RoleFormProps {
  permissions: Permission[];
  defaultValues?: RoleFormData & { status?: string };
  existingRole?: Role;
  onSubmit?: (data: RoleFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function RoleForm({
  permissions,
  defaultValues,
  existingRole,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: RoleFormProps) {
  // Extract existing permission IDs if editing
  const existingPermissionIds = existingRole?.rolePermissions.map(
    (rp) => rp.permission.id
  ) || defaultValues?.permissionIds || [];

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    existingPermissionIds
  );

  // Update selected permissions when existingRole changes
  useEffect(() => {
    if (existingRole) {
      const newPermissionIds = existingRole.rolePermissions.map(
        (rp) => rp.permission.id
      );
      setSelectedPermissionIds(newPermissionIds);
    }
  }, [existingRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: RoleFormData = {
      roleName: formData.get('roleName') as string,
      description: formData.get('description') as string || undefined,
      permissionIds: selectedPermissionIds,
    };

    onSubmit?.(data);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="roleName"
            defaultValue={defaultValues?.roleName}
            placeholder="Enter role name (e.g., Sales Manager)"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={defaultValues?.description}
            placeholder="Enter role description"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Permissions
        </h3>
        <PermissionsToggle
          permissions={permissions}
          selectedPermissionIds={selectedPermissionIds}
          onToggle={handleTogglePermission}
        />
        <p className="text-xs text-slate-500 mt-2">
          {selectedPermissionIds.length} permission(s) selected
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { UserFormData, Role } from '../../types/sales-purchase.types';
import { getRoles } from '../../api/sales-purchase.api';

interface UserFormProps {
  defaultValues?: UserFormData;
  isEdit?: boolean;
  onSubmit?: (data: UserFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function UserForm({
  defaultValues,
  isEdit = false,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      setLoadingRoles(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: UserFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      roleId: formData.get('roleId') as string,
    };

    // Only include password on create, not on edit
    const password = formData.get('password') as string;
    if (password && !isEdit) {
      data.password = password;
    }

    const status = formData.get('status') as string;
    if (status) {
      data.status = status as 'ACTIVE' | 'INACTIVE';
    }

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            defaultValue={defaultValues?.name}
            placeholder="Enter user name"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            name="email"
            type="email"
            defaultValue={defaultValues?.email}
            placeholder="Enter email address"
            required
          />
        </div>
        {!isEdit && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              name="password"
              type="password"
              placeholder="Enter password"
              required
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          {loadingRoles ? (
            <div className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-500">
              Loading roles...
            </div>
          ) : (
            <select
              name="roleId"
              defaultValue={defaultValues?.roleId}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status || 'ACTIVE'}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
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
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import RoleForm from '../../components/rbac/RoleForm';
import { getPermissions, getRole, updateRole } from '../../api/sales-purchase.api';
import type { Permission, Role, RoleFormData } from '../../types/sales-purchase.types';

export default function EditRolePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    
    try {
      setLoading(true);
      const [permissionsData, roleData] = await Promise.all([
        getPermissions(),
        getRole(id)
      ]);
      setPermissions(permissionsData);
      setRole(roleData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: RoleFormData) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      await updateRole(id, data);
      navigate('/sales-purchase/roles');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Role</h1>
          <p className="text-slate-600 mt-1">Update role and permissions</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Role</h1>
          <p className="text-slate-600 mt-1">Update role and permissions</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Role</h1>
          <p className="text-slate-600 mt-1">Update role and permissions</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Role not found</div>
        </Card>
      </div>
    );
  }

  const defaultValues = {
    roleName: role.roleName,
    description: role.description,
    status: role.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Role</h1>
        <p className="text-slate-600 mt-1">Update role and permissions</p>
      </div>
      <Card className="border-slate-200">
        <div className="p-6">
          <RoleForm
            permissions={permissions}
            defaultValues={defaultValues}
            existingRole={role}
            onSubmit={handleSubmit}
            submitText="Update Role"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import RoleForm from '../../components/rbac/RoleForm';
import { getPermissions, createRole } from '../../api/sales-purchase.api';
import type { Permission, RoleFormData } from '../../types/sales-purchase.types';

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: RoleFormData) => {
    try {
      setSubmitting(true);
      await createRole(data);
      navigate('/sales-purchase/roles');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
          <p className="text-slate-600 mt-1">Create a new role with permissions</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading permissions...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
          <p className="text-slate-600 mt-1">Create a new role with permissions</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
        <p className="text-slate-600 mt-1">Create a new role with permissions</p>
      </div>
      <Card className="border-slate-200">
        <div className="p-6">
          <RoleForm
            permissions={permissions}
            onSubmit={handleSubmit}
            submitText="Create Role"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
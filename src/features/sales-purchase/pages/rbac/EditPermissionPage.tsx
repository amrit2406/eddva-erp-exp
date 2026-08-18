import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import PermissionForm from '../../components/rbac/PermissionForm';
import { getPermission, updatePermission } from '../../api/sales-purchase.api';
import type { Permission, PermissionFormData } from '../../types/sales-purchase.types';

export default function EditPermissionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermission();
  }, [id]);

  async function loadPermission() {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getPermission(id);
      setPermission(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load permission');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: PermissionFormData) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      await updatePermission(id, data);
      navigate('/sales-purchase/permissions');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to update permission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Permission</h1>
          <p className="text-slate-600 mt-1">Update permission details</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Permission</h1>
          <p className="text-slate-600 mt-1">Update permission details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Permission</h1>
          <p className="text-slate-600 mt-1">Update permission details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Permission not found</div>
        </Card>
      </div>
    );
  }

  const defaultValues = {
    permissionKey: permission.permissionKey,
    description: permission.description,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Permission</h1>
        <p className="text-slate-600 mt-1">Update permission details</p>
      </div>
      <Card className="border-slate-200">
        <div className="p-6">
          <PermissionForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            submitText="Update Permission"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
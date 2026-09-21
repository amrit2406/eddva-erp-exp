import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import PermissionForm from '../../components/rbac/PermissionForm';
import { getHostelPermission, updateHostelPermission } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { HostelPermissionFormData } from '../../types/role.types';

export default function EditPermissionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<HostelPermissionFormData>({
    resource: '',
    action: '',
    name: '',
    category: '',
    description: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getHostelPermission(id);
      setFormData({
        resource: data.resource,
        action: data.action,
        name: data.name,
        category: data.category,
        description: data.description ?? '',
        is_active: data.is_active,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load permission'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateHostelPermission(id, {
        resource: formData.resource.trim(),
        action: formData.action.trim(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
      });
      navigate('/hostel/permissions');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update permission'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Permission</h1>
        <p className="text-slate-600 mt-1">Update permission details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <PermissionForm
              value={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Update Permission"
              submittingLabel="Updating..."
              showActive
            />
          )}
        </div>
      </Card>
    </div>
  );
}

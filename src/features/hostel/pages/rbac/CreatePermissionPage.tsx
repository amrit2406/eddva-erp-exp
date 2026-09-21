import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import PermissionForm from '../../components/rbac/PermissionForm';
import { createHostelPermission } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { HostelPermissionFormData } from '../../types/role.types';

export default function CreatePermissionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<HostelPermissionFormData>({
    resource: '',
    action: '',
    name: '',
    category: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createHostelPermission({
        resource: formData.resource.trim(),
        action: formData.action.trim(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
      });
      navigate('/hostel/permissions');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create permission'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Permission</h1>
        <p className="text-slate-600 mt-1">Create a new hostel permission</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <PermissionForm
            value={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Create Permission"
            submittingLabel="Creating..."
          />
        </div>
      </Card>
    </div>
  );
}

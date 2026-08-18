import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import PermissionForm from '../../components/rbac/PermissionForm';
import { createPermission } from '../../api/sales-purchase.api';
import type { PermissionFormData } from '../../types/sales-purchase.types';

export default function CreatePermissionPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: PermissionFormData) => {
    try {
      setSubmitting(true);
      await createPermission(data);
      navigate('/sales-purchase/permissions');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to create permission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Permission</h1>
        <p className="text-slate-600 mt-1">Create a new system permission</p>
      </div>
      <Card className="border-slate-200">
        <div className="p-6">
          <PermissionForm
            onSubmit={handleSubmit}
            submitText="Create Permission"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
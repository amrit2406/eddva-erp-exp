import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import UserForm from '../../components/rbac/UserForm';
import { createUser } from '../../api/sales-purchase.api';
import type { UserFormData } from '../../types/sales-purchase.types';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    try {
      setSubmitting(true);
      await createUser(data);
      navigate('/sales-purchase/users');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create User</h1>
        <p className="text-slate-600 mt-1">Create a new sales & purchase user</p>
      </div>
      <Card className="border-slate-200">
        <div className="p-6">
          <UserForm
            onSubmit={handleSubmit}
            submitText="Create User"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
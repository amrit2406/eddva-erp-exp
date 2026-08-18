import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import UserForm from '../../components/rbac/UserForm';
import { getUser, updateUser } from '../../api/sales-purchase.api';
import type { User, UserFormData } from '../../types/sales-purchase.types';

export default function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getUser(id);
      setUser(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: UserFormData) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      await updateUser(id, data);
      navigate('/sales-purchase/users');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
          <p className="text-slate-600 mt-1">Update user details</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
          <p className="text-slate-600 mt-1">Update user details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
          <p className="text-slate-600 mt-1">Update user details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">User not found</div>
        </Card>
      </div>
    );
  }

  const defaultValues = {
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    status: user.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
        <p className="text-slate-600 mt-1">Update user details</p>
      </div>
      <Card className="border-slate-200">
        <div className="p-6">
          <UserForm
            defaultValues={defaultValues}
            isEdit={true}
            onSubmit={handleSubmit}
            submitText="Update User"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
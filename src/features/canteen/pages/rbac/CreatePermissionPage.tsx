import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../../../hooks/useToast';
import PermissionForm from '../../components/rbac/PermissionForm';
import { createPermission } from '../../api/roles.api';
import type { PermissionFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreatePermissionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: (data: PermissionFormData) => createPermission(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'permissions'] });
      toast.success(`Permission “${data.name}” added`);
      navigate('/canteen/permissions');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the permission')),
  });

  return (
    <div className="space-y-5">
      <Link to="/canteen/permissions" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Permissions
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New permission</h1>
        <p className="mt-0.5 text-sm text-slate-500">After adding it, give it to people by adding it to a role.</p>
      </div>
      <PermissionForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add permission" />
    </div>
  );
}

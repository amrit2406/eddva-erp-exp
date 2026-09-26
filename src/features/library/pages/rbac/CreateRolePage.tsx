import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../../../hooks/useToast';
import RoleForm from '../../components/rbac/RoleForm';
import { createRole } from '../../api/library.api';
import type { RoleFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateRolePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: (data: RoleFormData) => createRole(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'roles'] });
      toast.success(`Role “${data.name}” created`);
      navigate('/library/roles');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create the role')),
  });

  return (
    <div className="space-y-5">
      <Link to="/library/roles" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Roles
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New role</h1>
        <p className="mt-0.5 text-sm text-slate-500">A role is a set of permissions you can give to people.</p>
      </div>
      <RoleForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Create role" />
    </div>
  );
}

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { useToast } from '../../../../hooks/useToast';
import InstituteAdminGuard from '../../components/rbac/InstituteAdminGuard';
import RoleForm from '../../components/rbac/RoleForm';
import { getRole, updateRole } from '../../api/roles.api';
import type { RoleFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { useIsInstituteAdmin } from '../../utils/rbac.utils';

export default function EditRolePage() {
  const isInstituteAdmin = useIsInstituteAdmin();
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: role, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'role', id],
    queryFn: () => getRole(id),
    enabled: Boolean(id) && isInstituteAdmin,
  });

  const save = useMutation({
    mutationFn: (data: RoleFormData) => updateRole(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'role', id] });
      toast.success(`Role “${data.name}” saved`);
      navigate('/sales-purchase/roles');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the role')),
  });

  const users = role?._count?.user_roles ?? 0;

  return (
    <div className="space-y-5">
      <Link to="/sales-purchase/roles" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Roles
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{role ? `Edit ${role.name}` : 'Edit role'}</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {users > 0 ? `Changes apply straight away to the ${users} ${users === 1 ? 'person' : 'people'} with this role.` : 'Nobody has this role yet.'}
        </p>
      </div>

      {!isInstituteAdmin ? (
        <InstituteAdminGuard section="Roles" />
      ) : isLoading ? (
        <div className="space-y-5" aria-busy="true" aria-label="Loading">
          <div className="skeleton h-32 rounded-3xl" />
          <div className="skeleton h-96 rounded-3xl" />
        </div>
      ) : error || !role ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load role')} onRetry={() => refetch()} />
      ) : (
        <RoleForm role={role} onSubmit={(data) => save.mutate(data)} isSubmitting={save.isPending} submitText="Save changes" />
      )}
    </div>
  );
}

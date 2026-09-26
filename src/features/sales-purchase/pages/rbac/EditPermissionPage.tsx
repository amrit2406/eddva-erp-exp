import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { useToast } from '../../../../hooks/useToast';
import PermissionForm from '../../components/rbac/PermissionForm';
import { getPermission, updatePermission } from '../../api/roles.api';
import type { PermissionFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditPermissionPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: permission, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'permission', id],
    queryFn: () => getPermission(id),
    enabled: Boolean(id),
  });

  const save = useMutation({
    mutationFn: (data: PermissionFormData) => updatePermission(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'permissions'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'permission', id] });
      toast.success(`Permission “${data.name}” saved`);
      navigate('/sales-purchase/permissions');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the permission')),
  });

  return (
    <div className="space-y-5">
      <Link to="/sales-purchase/permissions" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Permissions
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit permission</h1>
        <p className="mt-0.5 text-sm text-slate-500">Changes apply to every role that has this permission.</p>
      </div>

      {isLoading ? (
        <div className="skeleton h-80 rounded-3xl" aria-busy="true" aria-label="Loading" />
      ) : error || !permission ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load permission')} onRetry={() => refetch()} />
      ) : (
        <PermissionForm permission={permission} onSubmit={(data) => save.mutate(data)} isSubmitting={save.isPending} submitText="Save changes" />
      )}
    </div>
  );
}

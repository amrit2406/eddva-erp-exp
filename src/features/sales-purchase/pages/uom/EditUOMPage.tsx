import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import UOMForm from '../../components/uom/UOMForm';
import { getUOM, updateUOM } from '../../api/sales-purchase.api';
import type { UOMFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditUOMPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: unit, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'uom', id], queryFn: () => getUOM(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: UOMFormData) => updateUOM(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'uoms'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'uom', id] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'items'] });
      toast.success(`Unit “${data.name}” saved`);
      navigate(`/sales-purchase/uom/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the unit')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: unit ? `/sales-purchase/uom/${id}` : '/sales-purchase/uom', label: unit?.name ?? 'Units of measure' }} title="Edit unit" subtitle="Items measured in this unit will show the change." />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !unit ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load unit')} onRetry={() => refetch()} />
      ) : (
        <UOMForm defaultValues={{ name: unit.name, symbol: unit.symbol }} uomId={unit.uom_id} onSubmit={(data) => save.mutate(data)} isSubmitting={save.isPending} submitText="Save changes" />
      )}
    </div>
  );
}

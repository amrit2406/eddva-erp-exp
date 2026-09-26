import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import GRNForm from '../../components/grn/GRNForm';
import { createGRN } from '../../api/sales-purchase.api';
import type { GRNFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateGRNPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // ?po=12 opens the form with that purchase order already chosen.
  const [params] = useSearchParams();
  const initialPoId = Number(params.get('po')) || undefined;

  const create = useMutation({
    mutationFn: (data: GRNFormData) => createGRN(data),
    onSuccess: (grn) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'grns'] });
      toast.success(`${grn?.grn_number ?? 'Goods receipt'} saved as a draft`);
      navigate(grn?.grn_id ? `/sales-purchase/grn/${grn.grn_id}` : '/sales-purchase/grn');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the goods receipt')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/grn', label: 'Goods received' }} title="Record goods received" subtitle="Saved as a draft first — post it once the quantities are checked." />
      <GRNForm initialPoId={initialPoId} onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Save receipt" />
    </div>
  );
}

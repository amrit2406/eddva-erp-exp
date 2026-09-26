import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import GRNForm from '../../components/grn/GRNForm';
import { getGRN, updateGRN } from '../../api/sales-purchase.api';
import type { GRNFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditGRNPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: grn, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'grn', id], queryFn: () => getGRN(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: GRNFormData) => updateGRN(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'grns'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'grn', id] });
      toast.success(`${grn?.grn_number ?? 'Goods receipt'} saved`);
      navigate(`/sales-purchase/grn/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the goods receipt')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: grn ? `/sales-purchase/grn/${id}` : '/sales-purchase/grn', label: grn?.grn_number ?? 'Goods received' }} title={grn ? `Edit ${grn.grn_number}` : 'Edit goods receipt'} subtitle="Only draft receipts can be edited." />
      {isLoading ? (
        <FormLoading />
      ) : error || !grn ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load goods receipt')} onRetry={() => refetch()} />
      ) : grn.status !== 'DRAFT' ? (
        <NextStep tone="bad">This receipt is {grn.status.toLowerCase()}, so it can't be edited any more.</NextStep>
      ) : (
        <GRNForm
          defaultValues={{
            purchase_order_id: grn.purchase_order_id,
            received_date: grn.received_date,
            warehouse_id: grn.warehouse_id,
            items: (grn.items ?? []).map((i) => ({
              po_item_id: i.po_item_id,
              received_qty: toNumber(i.received_qty),
              accepted_qty: toNumber(i.accepted_qty),
              rejected_qty: toNumber(i.rejected_qty),
            })),
          }}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

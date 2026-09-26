import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';
import { getSalesOrder, updateSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrderFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditSalesOrderPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: so, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'sales-order', id], queryFn: () => getSalesOrder(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: SalesOrderFormData) => updateSalesOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-order', id] });
      toast.success(`${so?.so_number ?? 'Sales order'} saved`);
      navigate(`/sales-purchase/sales-orders/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the sales order')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: so ? `/sales-purchase/sales-orders/${id}` : '/sales-purchase/sales-orders', label: so?.so_number ?? 'Sales orders' }} title={so ? `Edit ${so.so_number}` : 'Edit sales order'} subtitle="Only draft orders can be edited." />
      {isLoading ? (
        <FormLoading />
      ) : error || !so ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load sales order')} onRetry={() => refetch()} />
      ) : so.status !== 'DRAFT' ? (
        <NextStep tone="bad">This order is {so.status.toLowerCase().replace(/_/g, ' ')}, so it can't be edited any more.</NextStep>
      ) : (
        <SalesOrderForm
          defaultValues={{
            customer_id: so.customer_id,
            so_date: so.so_date,
            delivery_date: so.delivery_date ?? undefined,
            discount: toNumber(so.discount),
            items: (so.items ?? []).map((l) => ({ item_id: l.item_id, quantity: toNumber(l.quantity), unit_price: toNumber(l.unit_price), tax_code_id: l.tax_code_id, line_discount: toNumber(l.line_discount) })),
          }}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

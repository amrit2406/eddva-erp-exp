import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import SalesOrderForm from '../../components/sales-orders/SalesOrderForm';
import { createSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrderFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: SalesOrderFormData) => createSalesOrder(data),
    onSuccess: (so) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-orders'] });
      toast.success(`${so?.so_number ?? 'Sales order'} saved as a draft`);
      navigate(so?.so_id ? `/sales-purchase/sales-orders/${so.so_id}` : '/sales-purchase/sales-orders');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create the sales order')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/sales-orders', label: 'Sales orders' }} title="New sales order" subtitle="Saved as a draft — confirm it once the customer agrees." />
      <SalesOrderForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Save sales order" />
    </div>
  );
}

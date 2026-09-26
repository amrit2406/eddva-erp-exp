import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import SalesInvoiceForm from '../../components/sales-invoices/SalesInvoiceForm';
import { createSalesInvoice } from '../../api/sales-purchase.api';
import type { SalesInvoiceFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateSalesInvoicePage() {
  const navigate = useNavigate();
  // ?so=4 starts from that sales order.
  const [params] = useSearchParams();
  const initialSoId = Number(params.get('so')) || undefined;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: SalesInvoiceFormData) => createSalesInvoice(data),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-orders'] });
      toast.success(`${inv?.invoice_number ?? 'Invoice'} saved as a draft`);
      navigate(inv?.si_id ? `/sales-purchase/sales-invoices/${inv.si_id}` : '/sales-purchase/sales-invoices');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the invoice')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/sales-invoices', label: 'Sales invoices' }} title="New sales invoice" subtitle="Bill a customer. It's saved as a draft until you post it." />
      <SalesInvoiceForm initialSoId={initialSoId} onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Save invoice" />
    </div>
  );
}

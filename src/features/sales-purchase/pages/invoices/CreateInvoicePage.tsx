import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { createInvoice } from '../../api/sales-purchase.api';
import type { InvoiceFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: InvoiceFormData) => createInvoice(data),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoices'] });
      toast.success(`${inv?.invoice_number ?? 'Invoice'} saved as a draft`);
      navigate(inv?.pi_id ? `/sales-purchase/invoices/${inv.pi_id}` : '/sales-purchase/invoices');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the invoice')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/invoices', label: 'Purchase invoices' }} title="Record vendor invoice" subtitle="Enter the bill a vendor sent you. It's saved as a draft until you post it." />
      <InvoiceForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Save invoice" />
    </div>
  );
}

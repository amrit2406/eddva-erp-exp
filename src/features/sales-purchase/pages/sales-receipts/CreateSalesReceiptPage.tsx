import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import SettlementForm from '../../components/lines/SettlementForm';
import { createSalesReceipt, getSalesInvoices } from '../../api/sales-purchase.api';
import type { SalesReceiptFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateSalesReceiptPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // ?invoice=5 opens the form with that invoice already chosen.
  const [params] = useSearchParams();
  const initialInvoiceId = Number(params.get('invoice')) || undefined;
  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['sales-purchase', 'sales-invoices'], queryFn: getSalesInvoices });

  const create = useMutation({
    mutationFn: (data: SalesReceiptFormData) => createSalesReceipt(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoice', String(data.si_id)] });
      toast.success('Money received recorded');
      navigate(`/sales-purchase/sales-invoices/${data.si_id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not record the receipt')),
  });

  const receivable = invoices
    .filter((i) => i.status === 'POSTED' && toNumber(i.grand_total) - toNumber(i.paid_amount) > 0)
    .map((i) => ({ id: i.si_id, number: i.invoice_number, party: i.customer?.customer_name ?? 'Customer', total: toNumber(i.grand_total), balance: toNumber(i.grand_total) - toNumber(i.paid_amount) }));

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/sales-receipts', label: 'Money received' }} title="Record money received" subtitle="A payment a customer made against one of your posted invoices." />
      {isLoading ? (
        <FormLoading />
      ) : (
        <SettlementForm
          kind="receipt"
          invoices={receivable}
          initialInvoiceId={initialInvoiceId}
          onSubmit={(v) => create.mutate({ si_id: v.invoiceId, receipt_date: v.date, amount: v.amount, mode: v.mode, ...(v.reference ? { reference_no: v.reference } : {}) })}
          isSubmitting={create.isPending}
          submitText="Record receipt"
        />
      )}
    </div>
  );
}

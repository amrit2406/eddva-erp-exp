import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import SettlementForm from '../../components/lines/SettlementForm';
import { getSalesInvoices, getSalesReceipt, updateSalesReceipt } from '../../api/sales-purchase.api';
import type { SalesReceiptFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditSalesReceiptPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: payment, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'sales-receipt', id], queryFn: () => getSalesReceipt(id), enabled: Boolean(id) });
  const { data: invoices = [], isLoading: invLoading } = useQuery({ queryKey: ['sales-purchase', 'sales-invoices'], queryFn: getSalesInvoices });

  const save = useMutation({
    mutationFn: (data: SalesReceiptFormData) => updateSalesReceipt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-receipt', id] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoices'] });
      toast.success('Receipt saved');
      navigate(`/sales-purchase/sales-receipts/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the receipt')),
  });

  const inv = payment ? invoices.find((i) => i.si_id === payment.si_id) : undefined;
  // The balance available to this payment includes its own current amount.
  const options = inv && payment ? [{ id: inv.si_id, number: inv.invoice_number, party: inv.customer?.customer_name ?? 'Customer', total: toNumber(inv.grand_total), balance: toNumber(inv.grand_total) - toNumber(inv.paid_amount) + toNumber(payment.amount) }] : [];

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: payment ? `/sales-purchase/sales-receipts/${id}` : '/sales-purchase/sales-receipts', label: 'Receipt' }} title="Edit money received" />
      {isLoading || invLoading ? (
        <FormLoading />
      ) : error || !payment ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load receipt')} onRetry={() => refetch()} />
      ) : (
        <SettlementForm
          kind="receipt"
          invoices={options}
          lockInvoice
          defaultValues={{ invoiceId: payment.si_id, date: payment.receipt_date, amount: toNumber(payment.amount), mode: payment.mode, reference: payment.reference_no ?? '' }}
          onSubmit={(v) => save.mutate({ si_id: v.invoiceId, receipt_date: v.date, amount: v.amount, mode: v.mode, ...(v.reference ? { reference_no: v.reference } : {}) })}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

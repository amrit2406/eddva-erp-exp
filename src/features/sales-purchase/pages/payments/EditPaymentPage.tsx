import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import SettlementForm from '../../components/lines/SettlementForm';
import { getInvoices, getPayment, updatePayment } from '../../api/sales-purchase.api';
import type { PaymentFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditPaymentPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: payment, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'purchase-payment', id], queryFn: () => getPayment(id), enabled: Boolean(id) });
  const { data: invoices = [], isLoading: invLoading } = useQuery({ queryKey: ['sales-purchase', 'purchase-invoices'], queryFn: getInvoices });

  const save = useMutation({
    mutationFn: (data: PaymentFormData) => updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-payment', id] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoices'] });
      toast.success('Payment saved');
      navigate(`/sales-purchase/payments/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the payment')),
  });

  const inv = payment ? invoices.find((i) => i.pi_id === payment.pi_id) : undefined;
  // The balance available to this payment includes its own current amount.
  const options = inv && payment ? [{ id: inv.pi_id, number: inv.invoice_number, party: inv.vendor?.vendor_name ?? 'Vendor', total: toNumber(inv.grand_total), balance: toNumber(inv.grand_total) - toNumber(inv.paid_amount) + toNumber(payment.amount) }] : [];

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: payment ? `/sales-purchase/payments/${id}` : '/sales-purchase/payments', label: 'Payment' }} title="Edit payment" />
      {isLoading || invLoading ? (
        <FormLoading />
      ) : error || !payment ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load payment')} onRetry={() => refetch()} />
      ) : (
        <SettlementForm
          kind="payment"
          invoices={options}
          lockInvoice
          defaultValues={{ invoiceId: payment.pi_id, date: payment.payment_date, amount: toNumber(payment.amount), mode: payment.mode, reference: payment.reference_no ?? '' }}
          onSubmit={(v) => save.mutate({ pi_id: v.invoiceId, payment_date: v.date, amount: v.amount, mode: v.mode, ...(v.reference ? { reference_no: v.reference } : {}) })}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

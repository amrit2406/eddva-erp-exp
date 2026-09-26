import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import SettlementForm from '../../components/lines/SettlementForm';
import { createPayment, getInvoices } from '../../api/sales-purchase.api';
import type { PaymentFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreatePaymentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // ?invoice=5 opens the form with that invoice already chosen.
  const [params] = useSearchParams();
  const initialInvoiceId = Number(params.get('invoice')) || undefined;
  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['sales-purchase', 'purchase-invoices'], queryFn: getInvoices });

  const create = useMutation({
    mutationFn: (data: PaymentFormData) => createPayment(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoice', String(data.pi_id)] });
      toast.success('Payment recorded');
      navigate(`/sales-purchase/invoices/${data.pi_id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not record the payment')),
  });

  const payable = invoices
    .filter((i) => i.status === 'POSTED' && toNumber(i.grand_total) - toNumber(i.paid_amount) > 0)
    .map((i) => ({ id: i.pi_id, number: i.invoice_number, party: i.vendor?.vendor_name ?? 'Vendor', total: toNumber(i.grand_total), balance: toNumber(i.grand_total) - toNumber(i.paid_amount) }));

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/payments', label: 'Payments' }} title="Record payment" subtitle="Money you paid a vendor against one of their posted invoices." />
      {isLoading ? (
        <FormLoading />
      ) : (
        <SettlementForm
          kind="payment"
          invoices={payable}
          initialInvoiceId={initialInvoiceId}
          onSubmit={(v) => create.mutate({ pi_id: v.invoiceId, payment_date: v.date, amount: v.amount, mode: v.mode, ...(v.reference ? { reference_no: v.reference } : {}) })}
          isSubmitting={create.isPending}
          submitText="Record payment"
        />
      )}
    </div>
  );
}

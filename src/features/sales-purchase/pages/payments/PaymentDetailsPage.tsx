import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2, Wallet } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { btnQuietDanger, btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deletePayment, getPayment, getVendors } from '../../api/sales-purchase.api';
import { paymentModeLabel } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';

const link = 'text-brand-navy hover:text-brand hover:underline';

export default function PaymentDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: p, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'purchase-payment', id], queryFn: () => getPayment(id), enabled: Boolean(id) });
  const { data: vendors = [] } = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });

  const remove = useMutation({
    mutationFn: () => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoices'] });
      toast.success('Payment deleted');
      navigate('/sales-purchase/payments');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this payment')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/payments" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Payments
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !p) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load payment')} onRetry={() => refetch()} />
      </div>
    );
  }

  const vendor = vendors.find((v) => v.vendor_id === p.invoice?.vendor_id);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Wallet}
        title={rupees(toNumber(p.amount))}
        meta={`Paid ${longDate(p.payment_date)} by ${paymentModeLabel(p.mode).toLowerCase()}${vendor ? ` to ${vendor.vendor_name}` : ''}`}
        actions={
          <>
            <Link to={`/sales-purchase/payments/${p.payment_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnQuietDanger}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        }
      />
      <div className="max-w-xl">
        <InfoCard
          title="Payment"
          icon={Wallet}
          rows={[
            ['Amount', rupees(toNumber(p.amount))],
            ['Paid on', longDate(p.payment_date)],
            ['How', paymentModeLabel(p.mode)],
            ['Reference', p.reference_no ? <span key="r" className="font-mono">{p.reference_no}</span> : '—'],
            [
              'Invoice',
              <Link key="i" to={`/sales-purchase/invoices/${p.pi_id}`} className={link}>
                {p.invoice?.invoice_number ?? `#${p.pi_id}`}
              </Link>,
            ],
            [
              'Vendor',
              vendor ? (
                <Link key="v" to={`/sales-purchase/vendors/${vendor.vendor_id}`} className={link}>
                  {vendor.vendor_name}
                </Link>
              ) : (
                '—'
              ),
            ],
          ]}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this payment?"
        message={`The ${rupees(toNumber(p.amount))} payment will be removed, and that amount will show as owed again.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete payment'}
      />
    </div>
  );
}

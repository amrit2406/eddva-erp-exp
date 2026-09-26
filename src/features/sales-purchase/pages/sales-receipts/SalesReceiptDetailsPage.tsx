import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, HandCoins, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { btnQuietDanger, btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteSalesReceipt, getSalesReceipt, getCustomers } from '../../api/sales-purchase.api';
import { paymentModeLabel } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';

const link = 'text-brand-navy hover:text-brand hover:underline';

export default function SalesReceiptDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: p, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'sales-receipt', id], queryFn: () => getSalesReceipt(id), enabled: Boolean(id) });
  const { data: customers = [] } = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });

  const remove = useMutation({
    mutationFn: () => deleteSalesReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoices'] });
      toast.success('Receipt deleted');
      navigate('/sales-purchase/sales-receipts');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this receipt')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/sales-receipts" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Money received
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !p) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load receipt')} onRetry={() => refetch()} />
      </div>
    );
  }

  const customer = customers.find((v) => v.customer_id === p.invoice?.customer_id);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={HandCoins}
        title={rupees(toNumber(p.amount))}
        meta={`Received ${longDate(p.receipt_date)} by ${paymentModeLabel(p.mode).toLowerCase()}${customer ? ` from ${customer.customer_name}` : ''}`}
        actions={
          <>
            <Link to={`/sales-purchase/sales-receipts/${p.receipt_id}/edit`} className={btnSecondary}>
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
          title="Receipt"
          icon={HandCoins}
          rows={[
            ['Amount', rupees(toNumber(p.amount))],
            ['Received on', longDate(p.receipt_date)],
            ['How', paymentModeLabel(p.mode)],
            ['Reference', p.reference_no ? <span key="r" className="font-mono">{p.reference_no}</span> : '—'],
            [
              'Invoice',
              <Link key="i" to={`/sales-purchase/sales-invoices/${p.si_id}`} className={link}>
                {p.invoice?.invoice_number ?? `#${p.si_id}`}
              </Link>,
            ],
            [
              'Customer',
              customer ? (
                <Link key="v" to={`/sales-purchase/customers/${customer.customer_id}`} className={link}>
                  {customer.customer_name}
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
        title="Delete this receipt?"
        message={`The ${rupees(toNumber(p.amount))} receipt will be removed, and that amount will show as due again.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete receipt'}
      />
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Ban, CheckCircle2, CreditCard, FileText, HandCoins, Pencil } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { DocLinesCard, DocTotalsCard } from '../../components/lines/DocParts';
import { cancelSalesInvoice, getSalesInvoice, postSalesInvoice } from '../../api/sales-purchase.api';
import { docStatusInfo, paymentModeLabel } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';
import { paymentStatusInfo } from '../../utils/party';

const link = 'text-brand-navy hover:text-brand hover:underline';

export default function SalesInvoiceDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<'post' | 'cancel' | null>(null);
  const key = ['sales-purchase', 'sales-invoice', id];
  const { data: inv, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getSalesInvoice(id), enabled: Boolean(id) });

  const act = useMutation({
    mutationFn: (a: 'post' | 'cancel') => (a === 'post' ? postSalesInvoice(id) : cancelSalesInvoice(id)),
    onSuccess: (_, a) => {
      toast.success(`${inv?.invoice_number} ${a === 'post' ? 'posted' : 'cancelled'}`);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'dashboard'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'That action could not be completed')),
    onSettled: () => setConfirm(null),
  });

  const back = (
    <Link to="/sales-purchase/sales-invoices" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Sales invoices
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !inv) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load invoice')} onRetry={() => refetch()} />
      </div>
    );
  }

  const posted = inv.status === 'POSTED';
  const balance = Math.max(0, toNumber(inv.grand_total) - toNumber(inv.paid_amount));
  const overdue = posted && balance > 0 && !!inv.due_date && new Date(inv.due_date) < new Date(new Date().toDateString());
  const pay = paymentStatusInfo(inv.payment_status);
  const doc = docStatusInfo(inv.status);
  const receipts = inv.receipts ?? [];

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={FileText}
        title={inv.invoice_number}
        accent={overdue ? '#d03b3b' : posted ? pay.color : doc.color}
        status={
          <>
            <StatusPill label={doc.label} color={doc.color} />
            {posted && <StatusPill label={pay.label} color={pay.color} />}
          </>
        }
        meta={`${inv.customer?.customer_name ?? 'Customer'} · ${longDate(inv.invoice_date)}`}
        actions={
          inv.status === 'DRAFT' ? (
            <>
              <button type="button" onClick={() => setConfirm('post')} disabled={act.isPending} className={btnPrimary}>
                <CheckCircle2 className="h-4 w-4" /> Post invoice
              </button>
              <Link to={`/sales-purchase/sales-invoices/${inv.si_id}/edit`} className={btnSecondary}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <button type="button" onClick={() => setConfirm('cancel')} disabled={act.isPending} className={btnQuietDanger}>
                <Ban className="h-4 w-4" /> Cancel
              </button>
            </>
          ) : posted ? (
            <>
              {balance > 0 && (
                <Link to={`/sales-purchase/sales-receipts/new?invoice=${inv.si_id}`} className={btnPrimary}>
                  <HandCoins className="h-4 w-4" /> Record money received
                </Link>
              )}
              <button type="button" onClick={() => setConfirm('cancel')} disabled={act.isPending} className={btnQuietDanger}>
                <Ban className="h-4 w-4" /> Cancel
              </button>
            </>
          ) : undefined
        }
      >
        <NextStep tone={inv.status === 'CANCELLED' || overdue ? 'bad' : posted && balance === 0 ? 'good' : 'info'}>
          {inv.status === 'DRAFT'
            ? 'Check the invoice, then post it. Once posted, you can record money received against it.'
            : inv.status === 'CANCELLED'
              ? 'This invoice was cancelled and no longer counts.'
              : balance === 0
                ? 'Fully paid by the customer. Nothing left to do.'
                : overdue
                  ? `${rupees(balance)} is overdue — it was due on ${longDate(inv.due_date)}. Follow up with the customer.`
                  : `${rupees(balance)} still to receive${inv.due_date ? ` by ${longDate(inv.due_date)}` : ''}.`}
        </NextStep>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <DocLinesCard
            lines={(inv.items ?? []).map((l) => ({
              id: l.si_item_id,
              name: l.item?.item_name ?? `Item #${l.item_id}`,
              code: l.item?.item_code,
              quantity: l.quantity,
              unitPrice: l.unit_price,
              discount: l.line_discount,
              tax: toNumber(l.cgst_amount) + toNumber(l.sgst_amount) + toNumber(l.igst_amount),
              total: l.line_total,
            }))}
          />
          <InfoCard title={`Money received · ${receipts.length}`} icon={CreditCard} delay={60}>
            {receipts.length === 0 ? (
              <p className="text-sm text-slate-500">{posted ? 'Nothing received yet.' : 'Receipts can be recorded once the invoice is posted.'}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {receipts.map((r) => (
                  <li key={r.receipt_id} className="flex items-center gap-3 py-2 text-sm">
                    <Link to={`/sales-purchase/sales-receipts/${r.receipt_id}`} className="font-medium text-brand-navy hover:text-brand">
                      {shortDate(r.receipt_date)}
                    </Link>
                    <span className="text-slate-500">{paymentModeLabel(r.mode)}</span>
                    {r.reference_no && <span className="font-mono text-xs text-slate-400">{r.reference_no}</span>}
                    <span className="ml-auto font-semibold tabular-nums text-emerald-700">{rupees(toNumber(r.amount))}</span>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
        </div>
        <div className="space-y-5">
          <DocTotalsCard subtotal={inv.subtotal} discount={inv.discount} tax={inv.tax_amount} total={inv.grand_total} paid={inv.paid_amount} paidLabel="Received" balanceLabel="Still to receive" />
          <InfoCard
            title="Linked to"
            icon={FileText}
            delay={100}
            rows={[
              [
                'Customer',
                inv.customer ? (
                  <Link key="c" to={`/sales-purchase/customers/${inv.customer_id}`} className={link}>
                    {inv.customer.customer_name}
                  </Link>
                ) : (
                  '—'
                ),
              ],
              [
                'Sales order',
                inv.sales_order ? (
                  <Link key="so" to={`/sales-purchase/sales-orders/${inv.sales_order.so_id}`} className={link}>
                    {inv.sales_order.so_number}
                  </Link>
                ) : (
                  'Not linked'
                ),
              ],
              ['Due by', inv.due_date ? longDate(inv.due_date) : 'Not set'],
              ['Financial year', inv.financial_year],
            ]}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => !act.isPending && setConfirm(null)}
        onConfirm={() => confirm && act.mutate(confirm)}
        title={confirm === 'post' ? 'Post this invoice?' : 'Cancel this invoice?'}
        message={
          confirm === 'post'
            ? `${inv.invoice_number} (${rupees(toNumber(inv.grand_total))}) will be final and recorded as owed by ${inv.customer?.customer_name ?? 'the customer'}. It can't be edited afterwards.`
            : `${inv.invoice_number} will be cancelled and no longer count as owed.`
        }
        confirmText={act.isPending ? 'Working…' : confirm === 'post' ? 'Post invoice' : 'Cancel invoice'}
        cancelText="Go back"
      />
    </div>
  );
}

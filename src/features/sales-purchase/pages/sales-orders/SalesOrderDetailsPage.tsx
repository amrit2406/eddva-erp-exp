import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Ban, CheckCircle2, ClipboardList, FilePlus2, Handshake, Pencil } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { DocLinesCard, DocTotalsCard } from '../../components/lines/DocParts';
import StatusTracker from '../../../../components/premium/detail/StatusTracker';
import { cancelSalesOrder, confirmSalesOrder, getSalesOrder } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { SO_FLOW, SO_STATUS, soStatusInfo } from '../../utils/soStatus';

const qty = (v: string | number) => toNumber(v).toLocaleString('en-IN', { maximumFractionDigits: 3 });

export default function SalesOrderDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<'confirm' | 'cancel' | null>(null);
  const key = ['sales-purchase', 'sales-order', id];
  const { data: so, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getSalesOrder(id), enabled: Boolean(id) });

  const act = useMutation({
    mutationFn: (a: 'confirm' | 'cancel') => (a === 'confirm' ? confirmSalesOrder(id) : cancelSalesOrder(id)),
    onSuccess: (_, a) => {
      toast.success(`${so?.so_number} ${a === 'confirm' ? 'confirmed' : 'cancelled'}`);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'dashboard'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'That action could not be completed')),
    onSettled: () => setConfirm(null),
  });

  const back = (
    <Link to="/sales-purchase/sales-orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Sales orders
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !so) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load sales order')} onRetry={() => refetch()} />
      </div>
    );
  }

  const s = soStatusInfo(so.status);
  const invoiceable = so.status === 'CONFIRMED' || so.status === 'PARTIALLY_INVOICED';
  const flowIndex = SO_FLOW.indexOf(so.status as (typeof SO_FLOW)[number]);
  const current = flowIndex >= 0 ? flowIndex : so.confirmed_at ? 1 : 0;
  const dates: Record<string, string | null> = { DRAFT: shortDate(so.created_at), CONFIRMED: so.confirmed_at ? shortDate(so.confirmed_at) : null };
  const steps = SO_FLOW.map((k) => ({ key: k, ...SO_STATUS[k], date: dates[k] ?? null }));
  const stop = so.status === 'CANCELLED' ? { key: 'CANCELLED', ...SO_STATUS.CANCELLED, date: so.cancelled_at ? shortDate(so.cancelled_at) : null } : undefined;

  const note =
    so.status === 'DRAFT'
      ? 'Not confirmed yet. Check the items with the customer, then confirm the order.'
      : so.status === 'CONFIRMED'
        ? 'Confirmed. Create an invoice when you bill the customer.'
        : so.status === 'PARTIALLY_INVOICED'
          ? 'Part of this order has been invoiced. Invoice the rest when ready.'
          : so.status === 'CLOSED'
            ? 'Fully invoiced. Nothing left to do.'
            : 'This order was cancelled and will not go ahead.';

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={ClipboardList}
        title={so.so_number}
        accent={s.color}
        status={<StatusPill label={s.label} color={s.color} />}
        meta={`${so.customer?.customer_name ?? 'Customer'} · ordered ${longDate(so.so_date)}${so.delivery_date ? ` · deliver by ${longDate(so.delivery_date)}` : ''}`}
        actions={
          <>
            {so.status === 'DRAFT' && (
              <>
                <button type="button" onClick={() => setConfirm('confirm')} disabled={act.isPending} className={btnPrimary}>
                  <CheckCircle2 className="h-4 w-4" /> Confirm order
                </button>
                <Link to={`/sales-purchase/sales-orders/${so.so_id}/edit`} className={btnSecondary}>
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </>
            )}
            {invoiceable && (
              <Link to={`/sales-purchase/sales-invoices/new?so=${so.so_id}`} className={btnPrimary}>
                <FilePlus2 className="h-4 w-4" /> Create invoice
              </Link>
            )}
            {(so.status === 'DRAFT' || so.status === 'CONFIRMED') && (
              <button type="button" onClick={() => setConfirm('cancel')} disabled={act.isPending} className={btnQuietDanger}>
                <Ban className="h-4 w-4" /> Cancel order
              </button>
            )}
          </>
        }
      >
        <div className="space-y-5">
          <NextStep tone={so.status === 'CANCELLED' ? 'bad' : so.status === 'CLOSED' ? 'good' : 'info'}>{note}</NextStep>
          <div className="rounded-2xl bg-slate-50/60 px-4 py-4">
            <StatusTracker steps={steps} current={current} stop={stop} />
          </div>
        </div>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DocLinesCard
            lines={(so.items ?? []).map((l) => ({
              id: l.so_item_id,
              name: l.item?.item_name ?? `Item #${l.item_id}`,
              code: l.item?.item_code,
              quantity: l.quantity,
              unitPrice: l.unit_price,
              discount: l.line_discount,
              tax: l.line_tax_amount,
              total: l.line_total,
              note: toNumber(l.invoiced_qty) > 0 ? `${qty(l.invoiced_qty)} of ${qty(l.quantity)} invoiced` : undefined,
            }))}
          />
        </div>
        <div className="space-y-5">
          <DocTotalsCard subtotal={so.subtotal} discount={so.discount} tax={so.tax_amount} total={so.grand_total} />
          <InfoCard
            title="Customer"
            icon={Handshake}
            delay={100}
            action={
              so.customer && (
                <Link to={`/sales-purchase/customers/${so.customer_id}`} className="text-xs font-medium text-brand hover:text-brand-navy">
                  Open
                </Link>
              )
            }
            rows={[
              ['Name', so.customer?.customer_name ?? '—'],
              ['Code', so.customer?.customer_code ?? '—'],
              ['GSTIN', so.customer?.gstin ?? '—'],
              ['Financial year', so.financial_year],
            ]}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => !act.isPending && setConfirm(null)}
        onConfirm={() => confirm && act.mutate(confirm)}
        title={confirm === 'confirm' ? 'Confirm this sales order?' : 'Cancel this sales order?'}
        message={
          confirm === 'confirm'
            ? `${so.so_number} (${rupees(toNumber(so.grand_total))}) will be locked and ready to invoice. It can't be edited afterwards.`
            : `${so.so_number} will be stopped and can't be invoiced.`
        }
        confirmText={act.isPending ? 'Working…' : confirm === 'confirm' ? 'Confirm order' : 'Cancel order'}
        cancelText="Go back"
      />
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Ban, CheckCircle2, ClipboardList, FilePlus2, PackageCheck, Pencil, Truck } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import { cancelGRN, getGRN, postGRN } from '../../api/sales-purchase.api';
import { docStatusInfo } from '../../utils/docStatus';
import { getApiErrorMessage } from '../../utils/errors';

const qty = (v: string | number) => toNumber(v).toLocaleString('en-IN', { maximumFractionDigits: 3 });

export default function GRNDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<'post' | 'cancel' | null>(null);
  const key = ['sales-purchase', 'grn', id];
  const { data: grn, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getGRN(id), enabled: Boolean(id) });

  const act = useMutation({
    mutationFn: (action: 'post' | 'cancel') => (action === 'post' ? postGRN(id) : cancelGRN(id)),
    onSuccess: (_, action) => {
      toast.success(`${grn?.grn_number} ${action === 'post' ? 'posted' : 'cancelled'}`);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'grns'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-orders'] });
      if (grn) queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-order', String(grn.purchase_order_id)] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'That action could not be completed')),
    onSettled: () => setConfirm(null),
  });

  const back = (
    <Link to="/sales-purchase/grn" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Goods received
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !grn) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load goods receipt')} onRetry={() => refetch()} />
      </div>
    );
  }

  const s = docStatusInfo(grn.status);
  const items = grn.items ?? [];
  const rejectedTotal = items.reduce((sum, i) => sum + toNumber(i.rejected_qty), 0);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={PackageCheck}
        title={grn.grn_number}
        accent={s.color}
        status={<StatusPill label={s.label} color={s.color} />}
        meta={`Received ${longDate(grn.received_date)} · ${grn.vendor?.vendor_name ?? 'Vendor'}`}
        actions={
          grn.status === 'DRAFT' ? (
            <>
              <button type="button" onClick={() => setConfirm('post')} disabled={act.isPending} className={btnPrimary}>
                <CheckCircle2 className="h-4 w-4" /> Post receipt
              </button>
              <Link to={`/sales-purchase/grn/${grn.grn_id}/edit`} className={btnSecondary}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <button type="button" onClick={() => setConfirm('cancel')} disabled={act.isPending} className={btnQuietDanger}>
                <Ban className="h-4 w-4" /> Cancel
              </button>
            </>
          ) : grn.status === 'POSTED' ? (
            <Link to="/sales-purchase/invoices/new" className={btnPrimary}>
              <FilePlus2 className="h-4 w-4" /> Record vendor invoice
            </Link>
          ) : undefined
        }
      >
        <NextStep tone={grn.status === 'CANCELLED' ? 'bad' : grn.status === 'POSTED' ? 'good' : 'info'}>
          {grn.status === 'DRAFT'
            ? 'Check the quantities below, then post it. Posting records the goods against the purchase order.'
            : grn.status === 'POSTED'
              ? 'Goods are recorded against the order. Next, record the vendor’s invoice for them.'
              : 'This receipt was cancelled and no longer counts towards the order.'}
        </NextStep>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InfoCard title={`Items · ${items.length}`} icon={ClipboardList}>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">No items on this receipt.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 pr-3">Item</th>
                      <th className="px-3 py-2.5 text-right">Received</th>
                      <th className="px-3 py-2.5 text-right">Rejected</th>
                      <th className="py-2.5 pl-3 text-right">Accepted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((i) => (
                      <tr key={i.grn_item_id}>
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-slate-900">{i.item?.item_name ?? `Item #${i.item_id}`}</p>
                          {i.item?.item_code && <p className="font-mono text-[11px] text-slate-400">{i.item.item_code}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{qty(i.received_qty)}</td>
                        <td className={`px-3 py-2.5 text-right tabular-nums ${toNumber(i.rejected_qty) > 0 ? 'font-medium text-red-600' : 'text-slate-400'}`}>{qty(i.rejected_qty)}</td>
                        <td className="py-2.5 pl-3 text-right font-semibold tabular-nums text-slate-900">{qty(i.accepted_qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rejectedTotal > 0 && <p className="mt-3 text-xs text-red-600">{qty(rejectedTotal)} unit(s) were rejected — let the vendor know.</p>}
          </InfoCard>
        </div>
        <InfoCard
          title="Delivery"
          icon={Truck}
          delay={60}
          rows={[
            [
              'Purchase order',
              grn.purchase_order ? (
                <Link key="po" to={`/sales-purchase/purchase-orders/${grn.purchase_order.po_id}`} className="text-brand-navy hover:text-brand hover:underline">
                  {grn.purchase_order.po_number}
                </Link>
              ) : (
                '—'
              ),
            ],
            [
              'Vendor',
              grn.vendor ? (
                <Link key="v" to={`/sales-purchase/vendors/${grn.vendor_id}`} className="text-brand-navy hover:text-brand hover:underline">
                  {grn.vendor.vendor_name}
                </Link>
              ) : (
                '—'
              ),
            ],
            ['Received at', grn.warehouse?.name ?? '—'],
            ['Received on', longDate(grn.received_date)],
            ['Financial year', grn.financial_year],
          ]}
        />
      </div>

      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => !act.isPending && setConfirm(null)}
        onConfirm={() => confirm && act.mutate(confirm)}
        title={confirm === 'post' ? 'Post this goods receipt?' : 'Cancel this goods receipt?'}
        message={
          confirm === 'post'
            ? `${grn.grn_number} will be final: the goods are recorded against ${grn.purchase_order?.po_number ?? 'the order'} and it can no longer be edited.`
            : `${grn.grn_number} will be cancelled and won't count towards the order.`
        }
        confirmText={act.isPending ? 'Working…' : confirm === 'post' ? 'Post receipt' : 'Cancel receipt'}
        cancelText="Go back"
      />
    </div>
  );
}

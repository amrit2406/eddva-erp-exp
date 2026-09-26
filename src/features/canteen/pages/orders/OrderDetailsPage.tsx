import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Ban, ClipboardList, IndianRupee, Pencil, ShoppingBasket, Trash2, UserRound } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import StatusTracker, { type TrackerStep } from '../../../../components/premium/detail/StatusTracker';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { FoodMark } from '../../components/menu/FoodMark';
import { deleteOrder, getOrder, updateOrderStatus } from '../../api/canteen.api';
import type { Order, OrderStatus } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { NEXT_ORDER_STEP, ORDER_FLOW, ORDER_STATUS, dateTime, isOrderOpen, memberTypeInfo, orderStatusInfo, paymentModeLabel, paymentStatusInfo, shortRef } from '../../utils/labels';

const NOTE: Record<string, string> = {
  PLACED: 'The kitchen hasn’t started yet. Press “Start preparing” when they begin.',
  PREPARING: 'The kitchen is making it. Mark it ready once it’s waiting at the counter.',
  READY: 'Waiting at the counter. Mark it collected when the member picks it up.',
};

export default function OrderDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<'cancel' | 'delete' | null>(null);
  const key = ['canteen', 'order', id];
  const { data: order, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getOrder(id), enabled: Boolean(id) });

  const move = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, { status }),
    onSuccess: (_, status) => {
      queryClient.setQueryData<Order>(key, (current) => (current ? { ...current, status } : current));
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'orders'] });
      toast.success(status === 'CANCELLED' ? 'Order cancelled' : `Order is now “${orderStatusInfo(status).label}”`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update the order')),
    onSettled: () => setConfirm(null),
  });

  const remove = useMutation({
    mutationFn: () => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'orders'] });
      toast.success(`${order?.orderNumber ?? 'Order'} deleted`);
      navigate('/canteen/orders');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Could not delete this order'));
      setConfirm(null);
    },
  });

  const back = (
    <Link to="/canteen/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Orders
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !order) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load order')} onRetry={() => refetch()} />
      </div>
    );
  }

  const s = orderStatusInfo(order.status);
  const next = NEXT_ORDER_STEP[order.status];
  const cancelled = order.status === 'CANCELLED';
  const payments = (order.payments ?? []).filter((p) => !p.status || p.status === 'success');
  const paid = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
  const total = toNumber(order.totalAmount);
  const due = Math.max(0, Math.round((total - paid) * 100) / 100);
  const pay = paymentStatusInfo(order.paymentStatus);
  const title = order.orderNumber ?? `Order ${shortRef(order.id)}`;

  const steps: TrackerStep[] = ORDER_FLOW.map((key, i) => ({ key, ...ORDER_STATUS[key], date: i === 0 ? dateTime(order.orderDate ?? order.createdAt) : null }));
  const current = cancelled ? 0 : Math.max(0, ORDER_FLOW.indexOf(order.status as (typeof ORDER_FLOW)[number]));
  const stop = cancelled ? { key: 'CANCELLED', ...ORDER_STATUS.CANCELLED, date: dateTime(order.updatedAt) } : undefined;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={ClipboardList}
        title={title}
        status={
          <>
            <StatusPill label={s.label} color={s.color} />
            {!cancelled && <StatusPill label={pay.label} color={pay.color} />}
          </>
        }
        meta={`${dateTime(order.orderDate ?? order.createdAt)}${order.terminal ? ` · ${order.terminal.name}` : ''}`}
        accent={s.color}
        actions={
          <>
            {next && (
              <button type="button" onClick={() => move.mutate(next.status as OrderStatus)} disabled={move.isPending} className={btnPrimary}>
                {move.isPending && !confirm ? 'Saving…' : next.label} <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {!cancelled && due > 0 && (
              <Link to={`/canteen/orders/${order.id}/payments`} className={next ? btnSecondary : btnPrimary}>
                <IndianRupee className="h-4 w-4" /> Take payment
              </Link>
            )}
            {isOrderOpen(order.status) && (
              <Link to={`/canteen/orders/${order.id}/edit`} className={btnSecondary}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <StatusTracker steps={steps} current={current} stop={stop} />
          {cancelled ? (
            <NextStep tone="bad">This order was cancelled. Nothing needs to be served{paid > 0 ? `, but ${rupees(paid)} was paid — refund it to the member.` : '.'}</NextStep>
          ) : order.status === 'COMPLETED' ? (
            <NextStep tone={due > 0 ? 'bad' : 'good'}>{due > 0 ? `Collected, but ${rupees(due)} is still to be paid.` : 'Collected and fully paid. Nothing left to do.'}</NextStep>
          ) : (
            <NextStep>
              {NOTE[order.status] ?? s.hint}
              {due > 0 && ` ${rupees(due)} still to be paid.`}
            </NextStep>
          )}
        </div>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InfoCard title={`Items · ${order.items.length}`} icon={ShoppingBasket}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-3">Item</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="py-2 pl-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-2">
                          {line.item && <FoodMark type={line.item.foodType} />}
                          {line.item ? (
                            <Link to={`/canteen/menu/items/${line.itemId}`} className="font-medium text-slate-900 hover:text-brand">
                              {line.item.name}
                            </Link>
                          ) : (
                            <span className="text-slate-500">Removed item</span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{line.quantity}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{rupees(toNumber(line.unitPrice))}</td>
                      <td className="py-2.5 pl-3 text-right font-medium tabular-nums text-slate-900">{rupees(toNumber(line.subtotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto mt-3 max-w-xs space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Items</dt>
                <dd className="tabular-nums">{rupees(toNumber(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Tax</dt>
                <dd className="tabular-nums">{rupees(toNumber(order.taxAmount))}</dd>
              </div>
              {toNumber(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">−{rupees(toNumber(order.discountAmount))}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{rupees(total)}</dd>
              </div>
            </dl>
          </InfoCard>
        </div>

        <div className="space-y-5">
          <InfoCard
            title="Member"
            icon={UserRound}
            delay={60}
            rows={
              order.member
                ? [
                    ['Name', <Link to={`/canteen/members/${order.memberId}`} className="text-brand-navy hover:text-brand">{order.member.name}</Link>],
                    ['Type', memberTypeInfo(order.member.memberType).label],
                    ['ID card', <span className="font-mono text-xs">{order.member.idCardBarcode}</span>],
                  ]
                : [['Member', '—']]
            }
          />
          <InfoCard
            title="Payment"
            icon={IndianRupee}
            delay={90}
            action={
              !cancelled && (
                <Link to={`/canteen/orders/${order.id}/payments`} className="text-sm font-medium text-brand hover:text-brand-navy">
                  {due > 0 ? 'Take payment' : 'Details'}
                </Link>
              )
            }
            rows={[
              ['Paid', rupees(paid)],
              ['Still to pay', <span className={due > 0 ? 'text-red-600' : 'text-emerald-700'}>{rupees(due)}</span>],
            ]}
          >
            {payments.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>
                      {paymentModeLabel(p.paymentMode)} · {dateTime(p.paidAt ?? p.createdAt)}
                    </span>
                    <span className="font-medium tabular-nums text-slate-700">{rupees(toNumber(p.amount))}</span>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>

          <div className="flex flex-wrap gap-2">
            {!cancelled && order.status !== 'COMPLETED' && (
              <button type="button" onClick={() => setConfirm('cancel')} className={btnQuietDanger}>
                <Ban className="h-4 w-4" /> Cancel order
              </button>
            )}
            <button type="button" onClick={() => setConfirm('delete')} className={btnQuietDanger}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => !(move.isPending || remove.isPending) && setConfirm(null)}
        onConfirm={() => (confirm === 'cancel' ? move.mutate('CANCELLED') : remove.mutate())}
        title={confirm === 'cancel' ? 'Cancel this order?' : 'Delete this order?'}
        message={
          confirm === 'cancel'
            ? `${title} will be stopped and the kitchen won't make it.${paid > 0 ? ` ${rupees(paid)} has been paid — remember to refund it.` : ''}`
            : `${title} will be removed for good. This can't be undone.`
        }
        confirmText={confirm === 'cancel' ? (move.isPending ? 'Cancelling…' : 'Cancel order') : remove.isPending ? 'Deleting…' : 'Delete order'}
      />
    </div>
  );
}

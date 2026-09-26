import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Banknote, CircleEllipsis, CreditCard, IndianRupee, Smartphone, Trash2, Wallet } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { Field } from '../../../../components/premium/form/FormParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, cardClass, inputClass } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { createOrderPayment, deletePayment, getMember, getOrder, getOrderPayments } from '../../api/canteen.api';
import type { Payment, PaymentMode } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { dateTime, paymentModeLabel, paymentStatusInfo, shortRef } from '../../utils/labels';

const MODES: { mode: PaymentMode; icon: LucideIcon }[] = [
  { mode: 'CASH', icon: Banknote },
  { mode: 'UPI', icon: Smartphone },
  { mode: 'CARD', icon: CreditCard },
  { mode: 'WALLET', icon: Wallet },
  { mode: 'OTHER', icon: CircleEllipsis },
];

const REF_HINT: Partial<Record<PaymentMode, string>> = {
  UPI: 'UPI reference / UTR number',
  CARD: 'Last 4 digits or slip number',
  OTHER: 'How it was paid',
};

export default function OrderPaymentsPage() {
  const { orderId = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mode, setMode] = useState<PaymentMode>('CASH');
  const [amount, setAmount] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  const orderKey = ['canteen', 'order', orderId];
  const paymentsKey = ['canteen', 'order-payments', orderId];
  const { data: order, isLoading, error, refetch } = useQuery({ queryKey: orderKey, queryFn: () => getOrder(orderId), enabled: Boolean(orderId) });
  const { data: payments = [] } = useQuery({ queryKey: paymentsKey, queryFn: () => getOrderPayments(orderId), enabled: Boolean(orderId) });
  const { data: member } = useQuery({ queryKey: ['canteen', 'member', order?.memberId], queryFn: () => getMember(order!.memberId), enabled: Boolean(order?.memberId) });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: orderKey });
    queryClient.invalidateQueries({ queryKey: paymentsKey });
    queryClient.invalidateQueries({ queryKey: ['canteen', 'orders'] });
    if (order) queryClient.invalidateQueries({ queryKey: ['canteen', 'member', order.memberId] });
    queryClient.invalidateQueries({ queryKey: ['canteen', 'members'] });
  };

  const pay = useMutation({
    mutationFn: (value: number) => createOrderPayment(orderId, { paymentMode: mode, amount: value, transactionRef: reference.trim() || undefined }),
    onSuccess: (_, value) => {
      refresh();
      toast.success(`${rupees(value)} received by ${paymentModeLabel(mode).toLowerCase()}`);
      setAmount(null);
      setReference('');
      setShowErrors(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not record the payment')),
  });

  const remove = useMutation({
    mutationFn: (p: Payment) => deletePayment(p.id),
    onSuccess: () => {
      refresh();
      toast.success('Payment removed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove the payment')),
    onSettled: () => setPendingDelete(null),
  });

  const back = (
    <Link to={orderId ? `/canteen/orders/${orderId}` : '/canteen/orders'} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Back to the order
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

  const good = payments.filter((p) => !p.status || p.status === 'success');
  const paid = good.reduce((sum, p) => sum + toNumber(p.amount), 0);
  const total = toNumber(order.totalAmount);
  const due = Math.max(0, Math.round((total - paid) * 100) / 100);
  const cancelled = order.status === 'CANCELLED';
  const title = order.orderNumber ?? `Order ${shortRef(order.id)}`;
  const wallet = member?.wallet;

  // The amount box starts at whatever is still due.
  const amountText = amount ?? (due > 0 ? String(due) : '');
  const value = Number(amountText);
  const amountError =
    !amountText.trim() || !(value > 0)
      ? 'Enter an amount above ₹0'
      : value > due + 0.001
        ? `Only ${rupees(due)} is still due`
        : mode === 'WALLET' && !wallet
          ? `${member?.name ?? 'This member'} has no wallet`
          : mode === 'WALLET' && wallet?.status === 'BLOCKED'
            ? 'This wallet is blocked'
            : mode === 'WALLET' && wallet && value > toNumber(wallet.balance)
              ? `Wallet only has ${rupees(toNumber(wallet.balance))}`
              : undefined;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountError) {
      setShowErrors(true);
      return;
    }
    pay.mutate(value);
  };

  const status = paymentStatusInfo(order.paymentStatus);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={IndianRupee}
        title={`Payments · ${title}`}
        status={!cancelled && <StatusPill label={status.label} color={status.color} />}
        meta={order.member ? `For ${order.member.name}` : undefined}
      >
        <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
          {[
            ['Bill', rupees(total), 'text-slate-900'],
            ['Paid', rupees(paid), 'text-emerald-700'],
            ['Still to pay', rupees(due), due > 0 ? 'text-red-600' : 'text-slate-400'],
          ].map(([label, amountLabel, tone]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`text-lg font-semibold tabular-nums ${tone}`}>{amountLabel}</p>
            </div>
          ))}
        </div>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div>
          {cancelled ? (
            <NextStep tone="bad">This order was cancelled, so no payment is needed.{paid > 0 && ' Remove or refund the payments below.'}</NextStep>
          ) : due <= 0 ? (
            <NextStep tone="good">Fully paid — nothing more to collect.</NextStep>
          ) : (
            <form onSubmit={handlePay} noValidate className={`${cardClass} animate-rise space-y-4`}>
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Take payment</h2>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Paid by</span>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment mode">
                  {MODES.map(({ mode: m, icon: Icon }) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={mode === m}
                      onClick={() => setMode(m)}
                      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium ring-1 transition ${mode === m ? 'bg-brand/5 text-brand-navy ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {m === 'WALLET' ? 'Wallet' : paymentModeLabel(m)}
                    </button>
                  ))}
                </div>
                {mode === 'WALLET' && (
                  <p className="mt-2 text-xs text-slate-500">
                    {wallet ? (
                      <>
                        Wallet balance: <span className="font-medium text-slate-700">{rupees(toNumber(wallet.balance))}</span>
                        {wallet.status === 'BLOCKED' && <span className="font-medium text-red-600"> · blocked</span>}
                      </>
                    ) : (
                      <>
                        No wallet yet.{' '}
                        <Link to={`/canteen/members/${order.memberId}/wallet`} className="font-medium text-brand hover:text-brand-navy">
                          Set one up
                        </Link>
                      </>
                    )}
                  </p>
                )}
              </div>
              <Field label="Amount (₹)" error={showErrors || amount !== null ? amountError : undefined}>
                <input type="number" min={0} step="0.01" value={amountText} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} text-base`} />
              </Field>
              {REF_HINT[mode] && (
                <Field label={`${REF_HINT[mode]} (optional)`}>
                  <input value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" className={inputClass} />
                </Field>
              )}
              <button type="submit" disabled={pay.isPending} className={`${btnPrimary} w-full`}>
                {pay.isPending ? 'Saving…' : `Receive ${Number.isFinite(value) && value > 0 ? rupees(value) : 'payment'}`}
              </button>
            </form>
          )}
        </div>

        <InfoCard title={`Payments received · ${payments.length}`} icon={IndianRupee} delay={60}>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...payments]
                .sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt))
                .map((p) => {
                  const Icon = MODES.find((m) => m.mode === p.paymentMode)?.icon ?? CircleEllipsis;
                  const failed = p.status && p.status !== 'success';
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {paymentModeLabel(p.paymentMode)}
                          {failed && <span className="ml-2 text-xs font-medium text-red-600">{p.status}</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {dateTime(p.paidAt ?? p.createdAt)}
                          {p.transactionRef ? ` · Ref ${p.transactionRef}` : ''}
                        </p>
                      </div>
                      <span className={`ml-auto whitespace-nowrap font-semibold tabular-nums ${failed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{rupees(toNumber(p.amount))}</span>
                      <IconAction icon={Trash2} label="Remove payment" tone="danger" onClick={() => setPendingDelete(p)} />
                    </li>
                  );
                })}
            </ul>
          )}
        </InfoCard>
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Remove this payment?"
        message={
          pendingDelete
            ? `The ${paymentModeLabel(pendingDelete.paymentMode).toLowerCase()} payment of ${rupees(toNumber(pendingDelete.amount))} will be removed and the order will show it as unpaid again. Only do this if it was entered by mistake.`
            : ''
        }
        confirmText={remove.isPending ? 'Removing…' : 'Remove payment'}
      />
    </div>
  );
}

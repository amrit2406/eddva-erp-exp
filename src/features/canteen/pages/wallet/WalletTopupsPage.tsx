import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Banknote, Building2, CircleEllipsis, CreditCard, History, Plus, Smartphone } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { Field } from '../../../../components/premium/form/FormParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import Pagination from '../../../../components/premium/list/Pagination';
import { btnPrimary, cardClass, inputClass } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { createWalletTopup, getWallet, getWalletTopups } from '../../api/canteen.api';
import type { TopupPaymentMode } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { dateTime, paymentModeLabel } from '../../utils/labels';

const MODES: { mode: TopupPaymentMode; icon: LucideIcon }[] = [
  { mode: 'CASH', icon: Banknote },
  { mode: 'UPI', icon: Smartphone },
  { mode: 'CARD', icon: CreditCard },
  { mode: 'BANK_TRANSFER', icon: Building2 },
  { mode: 'OTHER', icon: CircleEllipsis },
];
const QUICK = [100, 200, 500, 1000];
const PAGE_SIZE = 10;

export default function WalletTopupsPage() {
  const { walletId = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<TopupPaymentMode>('CASH');
  const [reference, setReference] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [page, setPage] = useState(1);

  const walletKey = ['canteen', 'wallet', walletId];
  const topupsKey = ['canteen', 'wallet-topups', walletId];
  const { data: wallet, isLoading, error, refetch } = useQuery({ queryKey: walletKey, queryFn: () => getWallet(walletId), enabled: Boolean(walletId) });
  const { data: topups = [] } = useQuery({ queryKey: topupsKey, queryFn: () => getWalletTopups(walletId), enabled: Boolean(walletId) });

  const add = useMutation({
    mutationFn: (value: number) => createWalletTopup(walletId, { amount: value, paymentMode: mode, transactionRef: reference.trim() || undefined }),
    onSuccess: (_, value) => {
      queryClient.invalidateQueries({ queryKey: walletKey });
      queryClient.invalidateQueries({ queryKey: topupsKey });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'wallet-txns', walletId] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'members'] });
      if (wallet) queryClient.invalidateQueries({ queryKey: ['canteen', 'member', wallet.memberId] });
      toast.success(`${rupees(value)} added to the wallet`);
      setAmount('');
      setReference('');
      setShowErrors(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the money')),
  });

  const back = (
    <Link to={wallet ? `/canteen/members/${wallet.memberId}/wallet` : '/canteen/wallets'} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> {wallet?.member?.name ? `${wallet.member.name}’s wallet` : 'Wallets'}
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !wallet) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load wallet')} onRetry={() => refetch()} />
      </div>
    );
  }

  const value = Number(amount);
  const amountError = !amount.trim() || !(value > 0) ? 'Enter an amount above ₹0' : undefined;
  const balance = toNumber(wallet.balance);
  const sorted = [...topups].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalAdded = topups.reduce((sum, t) => sum + toNumber(t.amount), 0);
  const current = Math.min(page, Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountError) {
      setShowErrors(true);
      return;
    }
    add.mutate(value);
  };

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Plus}
        title="Add money"
        status={wallet.status === 'BLOCKED' && <StatusPill label="Blocked" color="#d03b3b" />}
        meta={wallet.member ? `To ${wallet.member.name}’s wallet` : undefined}
      >
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Balance now</p>
            <p className="text-3xl font-semibold tabular-nums text-slate-900">{rupees(balance)}</p>
          </div>
          {value > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">After adding</p>
              <p className="text-3xl font-semibold tabular-nums text-emerald-700">{rupees(Math.round((balance + value) * 100) / 100)}</p>
            </div>
          )}
        </div>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} noValidate className={`${cardClass} animate-rise space-y-4 self-start`}>
          {wallet.status === 'BLOCKED' && <NextStep tone="bad">This wallet is blocked. Money can be added, but it can’t be spent until it’s unblocked.</NextStep>}
          <Field label="Amount (₹)" error={showErrors ? amountError : undefined}>
            <input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" autoFocus className={`${inputClass} text-base`} />
            <span className="mt-1.5 flex gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${value === q ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  ₹{q.toLocaleString('en-IN')}
                </button>
              ))}
            </span>
          </Field>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Received by</span>
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
                  {m === 'BANK_TRANSFER' ? 'Bank' : paymentModeLabel(m)}
                </button>
              ))}
            </div>
          </div>
          {mode !== 'CASH' && (
            <Field label="Reference (optional)" hint="UPI / UTR number, card slip or bank reference.">
              <input value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" className={inputClass} />
            </Field>
          )}
          <button type="submit" disabled={add.isPending} className={`${btnPrimary} w-full`}>
            {add.isPending ? 'Adding…' : `Add ${value > 0 ? rupees(value) : 'money'}`}
          </button>
        </form>

        <div className="space-y-3">
          <InfoCard
            title={`Money added before · ${topups.length}`}
            icon={History}
            delay={60}
            action={topups.length > 0 && <span className="text-sm font-medium text-slate-700">{rupees(totalAdded)} in total</span>}
          >
            {sorted.length === 0 ? (
              <p className="text-sm text-slate-500">No money added yet (the opening balance shows under transactions).</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((t) => {
                  const Icon = MODES.find((m) => m.mode === t.paymentMode)?.icon ?? CircleEllipsis;
                  return (
                    <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{paymentModeLabel(t.paymentMode)}</p>
                        <p className="truncate text-xs text-slate-500">
                          {dateTime(t.createdAt)}
                          {t.transactionRef ? ` · Ref ${t.transactionRef}` : ''}
                        </p>
                      </div>
                      <span className="ml-auto whitespace-nowrap font-semibold tabular-nums text-emerald-700">+{rupees(toNumber(t.amount))}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoCard>
          {sorted.length > PAGE_SIZE && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
              <Pagination page={current} pageSize={PAGE_SIZE} total={sorted.length} onPage={setPage} noun="top-ups" />
            </div>
          )}
          <Link to={`/canteen/wallets/${wallet.id}/transactions`} className="inline-block text-sm font-medium text-brand hover:text-brand-navy">
            See every transaction
          </Link>
        </div>
      </div>
    </div>
  );
}

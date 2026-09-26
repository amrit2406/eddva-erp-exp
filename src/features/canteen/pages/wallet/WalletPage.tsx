import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Gauge, History, Lock, LockOpen, Plus, Trash2, Wallet } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import Modal from '../../../../components/ui/Modal';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { Field, FormCard } from '../../../../components/premium/form/FormParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnQuietDanger, btnSecondary, inputClass, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { blockWallet, createMemberWallet, deleteWallet, getMember, getWalletTransactions, unblockWallet, updateWallet } from '../../api/canteen.api';
import type { Wallet as WalletType } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { dateTime, memberTypeInfo, txnLabel } from '../../utils/labels';

const RECENT = 6;
const LIMITS = [100, 200, 500];

export default function WalletPage() {
  const { memberId = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const memberKey = ['canteen', 'member', memberId];
  const { data: member, isLoading, error, refetch } = useQuery({ queryKey: memberKey, queryFn: () => getMember(memberId), enabled: Boolean(memberId) });
  const wallet = member?.wallet ?? null;
  const { data: txns = [] } = useQuery({ queryKey: ['canteen', 'wallet-txns', wallet?.id], queryFn: () => getWalletTransactions(wallet!.id), enabled: Boolean(wallet?.id) });

  const [start, setStart] = useState('');
  const [limit, setLimit] = useState('200');
  const [editLimit, setEditLimit] = useState<string | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState<'unblock' | 'delete' | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const done = (message: string, next?: WalletType | null) => {
    if (next !== undefined) queryClient.setQueryData(memberKey, (current: typeof member) => (current ? { ...current, wallet: next } : current));
    queryClient.invalidateQueries({ queryKey: memberKey });
    queryClient.invalidateQueries({ queryKey: ['canteen', 'members'] });
    toast.success(message);
  };
  const failed = (fallback: string) => (err: unknown) => toast.error(getApiErrorMessage(err, fallback));

  const create = useMutation({
    mutationFn: () => createMemberWallet(memberId, { initialBalance: Number(start || 0), dailySpendLimit: Number(limit) }),
    onSuccess: (w) => done('Wallet ready', w),
    onError: failed('Could not set up the wallet'),
  });
  const saveLimit = useMutation({
    mutationFn: (value: number) => updateWallet(wallet!.id, { dailySpendLimit: value }),
    onSuccess: (w) => {
      done('Daily limit saved', w ? { ...wallet!, ...w } : undefined);
      setEditLimit(null);
    },
    onError: failed('Could not save the limit'),
  });
  const block = useMutation({
    mutationFn: () => blockWallet(wallet!.id, { reason: reason.trim() }),
    onSuccess: (w) => {
      done('Wallet blocked', w ? { ...wallet!, ...w } : undefined);
      setBlockOpen(false);
      setReason('');
    },
    onError: failed('Could not block the wallet'),
  });
  const unblock = useMutation({
    mutationFn: () => unblockWallet(wallet!.id),
    onSuccess: (w) => done('Wallet unblocked', w ? { ...wallet!, ...w } : undefined),
    onError: failed('Could not unblock the wallet'),
    onSettled: () => setConfirm(null),
  });
  const remove = useMutation({
    mutationFn: () => deleteWallet(wallet!.id),
    onSuccess: () => done('Wallet removed', null),
    onError: failed('Could not remove the wallet'),
    onSettled: () => setConfirm(null),
  });

  const back = (
    <Link to="/canteen/wallets" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Wallets
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !member) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load member')} onRetry={() => refetch()} />
      </div>
    );
  }

  const type = memberTypeInfo(member.memberType);
  const firstName = member.name.split(' ')[0];

  // No wallet yet: a short setup form.
  if (!wallet) {
    const startValue = Number(start || 0);
    const limitValue = Number(limit);
    const errors = {
      start: !Number.isFinite(startValue) || startValue < 0 ? 'Enter 0 or more' : undefined,
      limit: !(limitValue > 0) ? 'Enter a limit above ₹0' : undefined,
    };
    return (
      <div className="space-y-5">
        {back}
        <DetailHeader icon={Wallet} title={`${member.name}’s wallet`} status={<StatusPill label={type.label} color={type.color} />} meta={`${member.externalRefId} · Card ${member.idCardBarcode}`}>
          <NextStep>{firstName} doesn’t have a wallet yet. Set one up so they can pay at the counter with their ID card.</NextStep>
        </DetailHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (errors.start || errors.limit) return setShowErrors(true);
            create.mutate();
          }}
          className="space-y-5"
        >
          <FormCard title="Set up wallet">
            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <Field label="Starting money (₹)" error={showErrors ? errors.start : undefined} hint="Cash received now. Leave empty for ₹0.">
                <input type="number" min={0} step="0.01" value={start} onChange={(e) => setStart(e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Can spend per day (₹)" error={showErrors ? errors.limit : undefined}>
                <input type="number" min={1} step="1" value={limit} onChange={(e) => setLimit(e.target.value)} className={inputClass} />
                <LimitChips value={limit} onPick={setLimit} />
              </Field>
            </div>
          </FormCard>
          <div className="flex justify-end">
            <button type="submit" disabled={create.isPending} className={btnPrimary}>
              {create.isPending ? 'Setting up…' : 'Set up wallet'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const blocked = wallet.status === 'BLOCKED';
  const limitText = editLimit ?? '';
  const limitValue = Number(limitText);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Wallet}
        title={`${member.name}’s wallet`}
        status={<StatusPill label={blocked ? 'Blocked' : 'Active'} color={blocked ? '#d03b3b' : '#15936a'} />}
        meta={
          <>
            <Link to={`/canteen/members/${member.id}`} className="hover:text-brand">
              {type.label} · {member.externalRefId}
            </Link>{' '}
            · Since {longDate(wallet.createdAt)}
          </>
        }
        accent={blocked ? '#d03b3b' : undefined}
        actions={
          <>
            <Link to={`/canteen/wallets/${wallet.id}/topups`} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Add money
            </Link>
            {blocked ? (
              <button type="button" onClick={() => setConfirm('unblock')} className={btnSecondary}>
                <LockOpen className="h-4 w-4" /> Unblock
              </button>
            ) : (
              <button type="button" onClick={() => setBlockOpen(true)} className={btnSecondary}>
                <Lock className="h-4 w-4" /> Block
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Balance</p>
            <p className="text-4xl font-semibold tabular-nums tracking-tight text-slate-900">{rupees(toNumber(wallet.balance))}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Can spend per day</p>
            <p className="text-xl font-semibold tabular-nums text-slate-700">{rupees(toNumber(wallet.dailySpendLimit))}</p>
          </div>
        </div>
        {blocked && (
          <div className="mt-4">
            <NextStep tone="bad">Blocked{wallet.blockedReason ? `: ${wallet.blockedReason}` : ''}. {firstName} can’t pay with this wallet until it’s unblocked.</NextStep>
          </div>
        )}
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <InfoCard title="Daily spending limit" icon={Gauge}>
            {editLimit === null ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Up to <span className="font-semibold text-slate-900">{rupees(toNumber(wallet.dailySpendLimit))}</span> a day.
                </p>
                <button type="button" onClick={() => setEditLimit(String(toNumber(wallet.dailySpendLimit)))} className="text-sm font-medium text-brand hover:text-brand-navy">
                  Change
                </button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (limitValue > 0) saveLimit.mutate(limitValue);
                }}
                className="space-y-3"
              >
                <Field label="Can spend per day (₹)" error={!(limitValue > 0) ? 'Enter a limit above ₹0' : undefined}>
                  <input type="number" min={1} step="1" value={limitText} onChange={(e) => setEditLimit(e.target.value)} autoFocus className={inputClass} />
                  <LimitChips value={limitText} onPick={(v) => setEditLimit(v)} />
                </Field>
                <div className="flex gap-2">
                  <button type="submit" disabled={saveLimit.isPending || !(limitValue > 0)} className={btnPrimary}>
                    {saveLimit.isPending ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditLimit(null)} className={btnSecondary}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </InfoCard>
          <button type="button" onClick={() => setConfirm('delete')} className={btnQuietDanger}>
            <Trash2 className="h-4 w-4" /> Remove wallet
          </button>
        </div>

        <div className="lg:col-span-2">
          <InfoCard
            title="Recent activity"
            icon={History}
            delay={60}
            action={
              <Link to={`/canteen/wallets/${wallet.id}/transactions`} className="text-sm font-medium text-brand hover:text-brand-navy">
                All transactions
              </Link>
            }
          >
            {txns.length === 0 ? (
              <p className="text-sm text-slate-500">No money in or out yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {[...txns]
                  .sort((a, b) => (b.transactedAt ?? b.createdAt ?? '').localeCompare(a.transactedAt ?? a.createdAt ?? ''))
                  .slice(0, RECENT)
                  .map((t) => {
                    const credit = t.type === 'CREDIT';
                    return (
                      <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${credit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{txnLabel(t)}</p>
                          <p className="text-xs text-slate-500">{dateTime(t.transactedAt ?? t.createdAt)}</p>
                        </div>
                        <span className={`ml-auto whitespace-nowrap font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {credit ? '+' : '−'}
                          {rupees(toNumber(t.amount))}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </InfoCard>
        </div>
      </div>

      <Modal isOpen={blockOpen} onClose={() => !block.isPending && setBlockOpen(false)} title="Block this wallet?" size="sm">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (reason.trim()) block.mutate();
            else setShowErrors(true);
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-600">{firstName} won’t be able to pay with the wallet until you unblock it. The balance stays safe.</p>
          <Field label="Reason" error={showErrors && !reason.trim() ? 'Say why, e.g. card lost' : undefined}>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. ID card lost" autoFocus className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setBlockOpen(false)} disabled={block.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={block.isPending} className={btnPrimary}>
              {block.isPending ? 'Blocking…' : 'Block wallet'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => !(unblock.isPending || remove.isPending) && setConfirm(null)}
        onConfirm={() => (confirm === 'unblock' ? unblock.mutate() : remove.mutate())}
        title={confirm === 'unblock' ? 'Unblock this wallet?' : 'Remove this wallet?'}
        message={
          confirm === 'unblock'
            ? `${firstName} will be able to pay with the wallet again.`
            : `${member.name}’s wallet will be removed for good.${toNumber(wallet.balance) > 0 ? ` It still holds ${rupees(toNumber(wallet.balance))} — refund that first.` : ''}`
        }
        confirmText={confirm === 'unblock' ? (unblock.isPending ? 'Unblocking…' : 'Unblock') : remove.isPending ? 'Removing…' : 'Remove wallet'}
      />
    </div>
  );
}

function LimitChips({ value, onPick }: { value: string; onPick: (value: string) => void }) {
  return (
    <span className="mt-1.5 flex gap-1.5">
      {LIMITS.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onPick(String(amount))}
          className={`rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${Number(value) === amount ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
        >
          ₹{amount}
        </button>
      ))}
    </span>
  );
}

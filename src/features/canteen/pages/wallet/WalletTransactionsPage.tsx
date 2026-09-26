import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, History, Plus } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailSkeleton } from '../../../../components/premium/detail/DetailParts';
import { Segmented } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getWallet, getWalletTransactions } from '../../api/canteen.api';
import type { WalletTransaction } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { dateTime, txnLabel } from '../../utils/labels';

const when = (t: WalletTransaction) => t.transactedAt ?? t.createdAt ?? '';

export default function WalletTransactionsPage() {
  const { walletId = '' } = useParams();
  const [show, setShow] = useState('all');
  const [page, setPage] = useState(1);
  const { data: wallet, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'wallet', walletId], queryFn: () => getWallet(walletId), enabled: Boolean(walletId) });
  const txnsQuery = useQuery({ queryKey: ['canteen', 'wallet-txns', walletId], queryFn: () => getWalletTransactions(walletId), enabled: Boolean(walletId) });
  const txns = useMemo(() => txnsQuery.data ?? [], [txnsQuery.data]);

  const moneyIn = txns.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + toNumber(t.amount), 0);
  const moneyOut = txns.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + toNumber(t.amount), 0);
  const filtered = useMemo(
    () => txns.filter((t) => (show === 'in' ? t.type === 'CREDIT' : show === 'out' ? t.type === 'DEBIT' : true)).sort((a, b) => when(b).localeCompare(when(a))),
    [txns, show],
  );

  const back = (
    <Link to={wallet ? `/canteen/members/${wallet.memberId}/wallet` : '/canteen/wallets'} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> {wallet?.member?.name ? `${wallet.member.name}’s wallet` : 'Wallets'}
    </Link>
  );

  if (isLoading || txnsQuery.isLoading) return <DetailSkeleton />;
  const failure = error ?? txnsQuery.error;
  if (failure || !wallet) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(failure, 'Failed to load transactions')} onRetry={() => (error ? refetch() : txnsQuery.refetch())} />
      </div>
    );
  }

  const addMoney = (
    <Link to={`/canteen/wallets/${wallet.id}/topups`} className={btnPrimary}>
      <Plus className="h-4 w-4" /> Add money
    </Link>
  );

  return (
    <div className="space-y-5">
      {back}
      <ListHeader icon={History} title="Transactions" description={`Every rupee in and out of ${wallet.member?.name ?? 'this member'}’s wallet.`} actions={addMoney}>
        <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
          {[
            ['Balance', rupees(toNumber(wallet.balance)), 'text-slate-900'],
            ['Money in', rupees(moneyIn), 'text-emerald-700'],
            ['Spent', rupees(moneyOut), 'text-slate-900'],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-slate-200/70">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className={`text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
            </div>
          ))}
        </div>
      </ListHeader>

      {txns.length === 0 ? (
        <EmptyState icon={History} title="No transactions yet" message="Money added and spent with this wallet will show up here." action={addMoney} />
      ) : (
        <>
          <Segmented
            label="Direction"
            value={show}
            onChange={(v) => {
              setShow(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All', count: txns.length },
              { value: 'in', label: 'Money in', count: txns.filter((t) => t.type === 'CREDIT').length },
              { value: 'out', label: 'Spent', count: txns.filter((t) => t.type === 'DEBIT').length },
            ]}
          />
          <PagedTable
            rows={filtered}
            rowKey={(t) => t.id}
            page={page}
            onPage={setPage}
            noun="transactions"
            minWidth={600}
            columns={[
              {
                header: 'What',
                cell: (t) => {
                  const credit = t.type === 'CREDIT';
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${credit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{txnLabel(t)}</p>
                        {t.referenceId && t.referenceId !== 'INITIAL_DEPOSIT' && <p className="font-mono text-[11px] text-slate-400">Ref {t.referenceId.slice(0, 8)}</p>}
                      </div>
                    </div>
                  );
                },
              },
              { header: 'When', cell: (t) => <span className="text-slate-600">{dateTime(when(t))}</span> },
              {
                header: 'Amount',
                align: 'right',
                cell: (t) => (
                  <span className={`font-semibold ${t.type === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {t.type === 'CREDIT' ? '+' : '−'}
                    {rupees(toNumber(t.amount))}
                  </span>
                ),
              },
              { header: 'Balance after', align: 'right', cell: (t) => <span className="text-slate-600">{rupees(toNumber(t.balanceAfter))}</span> },
            ]}
          />
        </>
      )}
    </div>
  );
}

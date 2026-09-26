import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, IndianRupee, List, UserRound, Wallet } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnSecondary } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getMembers } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import { memberTypeInfo } from '../../utils/labels';

export default function WalletsPage() {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState('all');
  const [page, setPage] = useState(1);
  // Members come with their wallet, so one request covers the whole page.
  const { data: members = [], isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'members'], queryFn: () => getMembers() });

  const withWallet = members.filter((m) => m.wallet);
  const blocked = withWallet.filter((m) => m.wallet?.status === 'BLOCKED').length;
  const totalHeld = withWallet.reduce((sum, m) => sum + toNumber(m.wallet?.balance), 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members
      .filter((m) => (show === 'with' ? m.wallet : show === 'blocked' ? m.wallet?.status === 'BLOCKED' : show === 'none' ? !m.wallet : true))
      .filter((m) => !q || [m.name, m.idCardBarcode, m.externalRefId].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => Number(Boolean(b.wallet)) - Number(Boolean(a.wallet)) || a.name.localeCompare(b.name));
  }, [members, search, show]);

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load wallets')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader
        icon={Wallet}
        title="Wallets"
        description="Prepaid money members spend at the counter using their ID card."
        actions={
          <Link to="/canteen/members" className={btnSecondary}>
            <UserRound className="h-4 w-4" /> Members
          </Link>
        }
      >
        {!isLoading && withWallet.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Money held in wallets', rupees(totalHeld)],
              ['Wallets', `${withWallet.length} of ${members.length} members`],
              ['Blocked', `${blocked}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-slate-200/70">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-lg font-semibold tabular-nums text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        )}
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No members yet"
          message="Add members first, then set up a wallet for each one."
          action={
            <Link to="/canteen/members/new" className={btnSecondary}>
              Add a member
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, ID card or school ID"
            />
            <Segmented
              label="Wallet status"
              value={show}
              onChange={(v) => {
                setShow(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: members.length },
                { value: 'with', label: 'Has wallet', count: withWallet.length },
                { value: 'blocked', label: 'Blocked', count: blocked },
                { value: 'none', label: 'No wallet', count: members.length - withWallet.length },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setShow('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(m) => m.id}
              page={page}
              onPage={setPage}
              noun="members"
              minWidth={700}
              columns={[
                {
                  header: 'Member',
                  cell: (m) => (
                    <div>
                      <Link to={`/canteen/members/${m.id}/wallet`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {m.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {memberTypeInfo(m.memberType).label} · {m.externalRefId}
                      </p>
                    </div>
                  ),
                },
                {
                  header: 'Balance',
                  align: 'right',
                  cell: (m) => (m.wallet ? <span className="font-semibold text-slate-900">{rupees(toNumber(m.wallet.balance))}</span> : <span className="text-slate-400">—</span>),
                },
                {
                  header: 'Daily limit',
                  align: 'right',
                  cell: (m) => (m.wallet ? <span className="text-slate-600">{rupees(toNumber(m.wallet.dailySpendLimit))}</span> : <span className="text-slate-400">—</span>),
                },
                {
                  header: 'Status',
                  cell: (m) =>
                    !m.wallet ? (
                      <StatusPill label="No wallet" color="#94a3b8" />
                    ) : m.wallet.status === 'BLOCKED' ? (
                      <StatusPill label="Blocked" color="#d03b3b" />
                    ) : (
                      <StatusPill label="Active" color="#15936a" />
                    ),
                },
              ]}
              actions={(m) => (
                <>
                  <IconAction icon={Eye} label={m.wallet ? 'Open wallet' : 'Set up wallet'} to={`/canteen/members/${m.id}/wallet`} tone="brand" />
                  <IconAction
                    icon={IndianRupee}
                    label={m.wallet ? 'Add money' : 'Set up a wallet first'}
                    to={m.wallet ? `/canteen/wallets/${m.wallet.id}/topups` : undefined}
                    disabled={!m.wallet}
                  />
                  <IconAction icon={List} label={m.wallet ? 'Transactions' : 'No transactions yet'} to={m.wallet ? `/canteen/wallets/${m.wallet.id}/transactions` : undefined} disabled={!m.wallet} />
                </>
              )}
            />
          )}
        </>
      )}
    </div>
  );
}

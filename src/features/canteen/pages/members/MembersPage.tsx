import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, ScanLine, Trash2, UserRound, Wallet } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, btnSecondary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteMember, getMembers } from '../../api/canteen.api';
import type { CanteenMember } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { MEMBER_TYPE, memberTypeInfo } from '../../utils/labels';

const KEY = ['canteen', 'members'];

export default function MembersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<CanteenMember | null>(null);
  const { data: members = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => getMembers() });

  const remove = useMutation({
    mutationFn: (m: CanteenMember) => deleteMember(m.id),
    onSuccess: (_, m) => {
      queryClient.setQueryData<CanteenMember[]>(KEY, (current) => current?.filter((x) => x.id !== m.id));
      toast.success(`${m.name} removed`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove this member')),
    onSettled: () => setPendingDelete(null),
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => (map[m.memberType] = (map[m.memberType] ?? 0) + 1));
    return map;
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members
      .filter((m) => type === 'all' || m.memberType === type)
      .filter((m) => !q || [m.name, m.idCardBarcode, m.externalRefId].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, search, type]);

  const newButton = (
    <Link to="/canteen/members/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New member
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load members')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader
        icon={UserRound}
        title="Members"
        description="Students, teachers and staff who order from the canteen."
        actions={
          <>
            <Link to="/canteen/members/lookup" className={btnSecondary}>
              <ScanLine className="h-4 w-4" /> Scan ID card
            </Link>
            {newButton}
          </>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : members.length === 0 ? (
        <EmptyState icon={UserRound} title="No members yet" message="Add the people who buy from the canteen. Give them a wallet so they can pay with their ID card." action={newButton} />
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
              label="Member type"
              value={type}
              onChange={(v) => {
                setType(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: members.length },
                ...Object.keys(MEMBER_TYPE)
                  .filter((t) => counts[t])
                  .map((t) => ({ value: t, label: `${MEMBER_TYPE[t].label}s`, count: counts[t] })),
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setType('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(m) => m.id}
              page={page}
              onPage={setPage}
              noun="members"
              minWidth={720}
              columns={[
                {
                  header: 'Member',
                  cell: (m) => (
                    <div>
                      <Link to={`/canteen/members/${m.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {m.name}
                      </Link>
                      <p className="text-xs text-slate-500">{m.externalRefId}</p>
                    </div>
                  ),
                },
                {
                  header: 'Type',
                  cell: (m) => {
                    const t = memberTypeInfo(m.memberType);
                    return <StatusPill label={t.label} color={t.color} />;
                  },
                },
                { header: 'ID card', cell: (m) => <span className="font-mono text-xs text-slate-600">{m.idCardBarcode}</span> },
                {
                  header: 'Wallet',
                  align: 'right',
                  cell: (m) =>
                    m.wallet ? (
                      <div>
                        <span className="font-medium text-slate-900">{rupees(toNumber(m.wallet.balance))}</span>
                        {m.wallet.status === 'BLOCKED' && <span className="block text-[11px] font-medium text-red-600">Blocked</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No wallet</span>
                    ),
                },
              ]}
              actions={(m) => (
                <>
                  <IconAction icon={Eye} label="View member" to={`/canteen/members/${m.id}`} tone="brand" />
                  <IconAction icon={Wallet} label={m.wallet ? 'Open wallet' : 'Set up wallet'} to={`/canteen/members/${m.id}/wallet`} />
                  <IconAction icon={Pencil} label="Edit member" to={`/canteen/members/${m.id}/edit`} />
                  <IconAction icon={Trash2} label="Remove member" tone="danger" onClick={() => setPendingDelete(m)} />
                </>
              )}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Remove this member?"
        message={
          pendingDelete
            ? `${pendingDelete.name} will no longer be able to order.${pendingDelete.wallet && toNumber(pendingDelete.wallet.balance) > 0 ? ` Their wallet still holds ${rupees(toNumber(pendingDelete.wallet.balance))} — refund it first.` : ''} If they have orders, the removal may be refused.`
            : ''
        }
        confirmText={remove.isPending ? 'Removing…' : 'Remove member'}
      />
    </div>
  );
}

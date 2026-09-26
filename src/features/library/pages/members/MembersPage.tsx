import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookPlus, Eye, Pencil, Plus, UserRound } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { getIssues } from '../../api/issues.api';
import { getMembers } from '../../api/library.api';
import { useToday } from '../../hooks/useToday';
import { getApiErrorMessage } from '../../utils/errors';
import { MEMBER_TYPE, isOut, loanState, memberStatusInfo, memberTypeInfo } from '../../utils/labels';

export default function MembersPage() {
  const today = useToday();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const { data: members = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'members'], queryFn: () => getMembers() });
  const { data: issues = [] } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });

  // Books each member has right now, and how many are late.
  const loans = useMemo(() => {
    const map = new Map<number, { out: number; late: number }>();
    issues.filter(isOut).forEach((i) => {
      const cur = map.get(i.member_id) ?? { out: 0, late: 0 };
      cur.out += 1;
      if (loanState(i, today) === 'overdue') cur.late += 1;
      map.set(i.member_id, cur);
    });
    return map;
  }, [issues, today]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => (map[m.member_type] = (map[m.member_type] ?? 0) + 1));
    return map;
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members
      .filter((m) => type === 'all' || m.member_type === type)
      .filter((m) => !q || [m.name, m.library_card_number, m.external_ref_id].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members, search, type]);

  const newButton = (
    <Link to="/library/members/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New member
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load members')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={UserRound} title="Members" description="Students and staff who can borrow books." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : members.length === 0 ? (
        <EmptyState icon={UserRound} title="No members yet" message="Add the people who borrow books. Each one gets a library card number." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name, card number or school ID"
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
                  .map((t) => ({ value: t, label: MEMBER_TYPE[t].label, count: counts[t] })),
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
              rowKey={(m) => m.member_id}
              page={page}
              onPage={setPage}
              noun="members"
              minWidth={720}
              columns={[
                {
                  header: 'Member',
                  cell: (m) => (
                    <div>
                      <Link to={`/library/members/${m.member_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {m.name}
                      </Link>
                      {m.external_ref_id && <p className="text-xs text-slate-500">{m.external_ref_id}</p>}
                    </div>
                  ),
                },
                { header: 'Card', cell: (m) => <span className="font-mono text-xs text-slate-600">{m.library_card_number}</span> },
                {
                  header: 'Type',
                  cell: (m) => {
                    const t = memberTypeInfo(m.member_type);
                    return <StatusPill label={t.label} color={t.color} />;
                  },
                },
                {
                  header: 'Has now',
                  cell: (m) => {
                    const l = loans.get(m.member_id);
                    if (!l) return <span className="text-xs text-slate-400">No books</span>;
                    return (
                      <span className="text-slate-700">
                        {l.out} book{l.out === 1 ? '' : 's'}
                        {l.late > 0 && <span className="ml-1.5 text-xs font-semibold text-red-600">{l.late} late</span>}
                      </span>
                    );
                  },
                },
                {
                  header: 'Status',
                  cell: (m) => {
                    const s = memberStatusInfo(m.status);
                    return <StatusPill label={s.label} color={s.color} />;
                  },
                },
              ]}
              actions={(m) => (
                <>
                  <IconAction icon={Eye} label="View member" to={`/library/members/${m.member_id}`} tone="brand" />
                  <IconAction
                    icon={BookPlus}
                    label={m.status === 'active' ? 'Lend a book' : `Can't borrow — ${memberStatusInfo(m.status).label.toLowerCase()}`}
                    to={`/library/issues/desk?memberId=${m.member_id}`}
                    disabled={m.status !== 'active'}
                  />
                  <IconAction icon={Pencil} label="Edit member" to={`/library/members/${m.member_id}/edit`} />
                </>
              )}
            />
          )}
        </>
      )}
    </div>
  );
}

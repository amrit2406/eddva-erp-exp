import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, RefreshCw, TriangleAlert, Undo2 } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { shortDate } from '../../../../components/premium/styles';
import { rupees } from '../../../../utils/dashboardFormat';
import LoanTabs from '../../components/issues/LoanTabs';
import { RenewDialog, ReturnDialog } from '../../components/loans/LoanDialogs';
import { getIssues } from '../../api/issues.api';
import { useToday } from '../../hooks/useToday';
import type { BookIssue } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { MAX_RENEWALS, daysBetween, fineIfReturnedToday, loanState, memberTypeInfo } from '../../utils/labels';

export default function OverdueDashboardPage() {
  const today = useToday();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState<BookIssue | null>(null);
  const [renewing, setRenewing] = useState<BookIssue | null>(null);
  // Worked out from due dates, so it's right even before the nightly overdue job runs.
  const { data: issues = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });

  const overdue = useMemo(() => issues.filter((i) => loanState(i, today) === 'overdue').sort((a, b) => a.due_date.localeCompare(b.due_date)), [issues, today]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return overdue.filter((i) => !q || [i.copy?.book?.title, i.member?.name, i.member?.library_card_number].some((v) => v?.toLowerCase().includes(q)));
  }, [overdue, search]);

  const people = new Set(overdue.map((i) => i.member_id)).size;
  const finesDue = overdue.reduce((s, i) => s + fineIfReturnedToday(i, today), 0);

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load overdue books')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={TriangleAlert} title="Overdue books" description="Books past their due date — the longest late first. Remind these members to bring them back.">
        <div className="space-y-4">
          <LoanTabs overdue={overdue.length} />
          {overdue.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
              {[
                ['Books late', `${overdue.length}`],
                ['Members', `${people}`],
                ['Fines if back today', rupees(finesDue)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-slate-200/70">
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-lg font-semibold tabular-nums text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : overdue.length === 0 ? (
        <EmptyState icon={TriangleAlert} title="Nothing is overdue" message="Every lent book is still within its due date." />
      ) : (
        <>
          <SearchBox
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by book, member or card"
          />
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(i) => i.issue_id}
              page={page}
              onPage={setPage}
              noun="books"
              minWidth={780}
              columns={[
                {
                  header: 'Late by',
                  cell: (i) => {
                    const days = daysBetween(i.due_date, today);
                    return (
                      <span className="inline-flex h-10 w-14 flex-col items-center justify-center rounded-xl bg-red-50 text-red-700">
                        <span className="text-base font-bold leading-none">{days}</span>
                        <span className="text-[10px]">day{days === 1 ? '' : 's'}</span>
                      </span>
                    );
                  },
                },
                {
                  header: 'Book',
                  cell: (i) => (
                    <div>
                      <Link to={`/library/issues/${i.issue_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {i.copy?.book?.title ?? `Copy #${i.copy_id}`}
                      </Link>
                      <p className="text-xs text-slate-500">Was due {shortDate(i.due_date)}</p>
                    </div>
                  ),
                },
                {
                  header: 'Member',
                  cell: (i) => (
                    <div>
                      <Link to={`/library/members/${i.member_id}`} className="text-slate-800 hover:text-brand">
                        {i.member?.name ?? `Member #${i.member_id}`}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {memberTypeInfo(i.member?.member_type).label} · {i.member?.library_card_number}
                      </p>
                    </div>
                  ),
                },
                {
                  header: 'Fine if back today',
                  align: 'right',
                  cell: (i) => {
                    const fine = fineIfReturnedToday(i, today);
                    return <span className={fine > 0 ? 'font-semibold text-red-600' : 'text-slate-400'}>{fine > 0 ? rupees(fine) : 'In free days'}</span>;
                  },
                },
              ]}
              actions={(i) => (
                <>
                  <IconAction icon={Eye} label="View loan" to={`/library/issues/${i.issue_id}`} tone="brand" />
                  <IconAction
                    icon={RefreshCw}
                    label={i.renewal_count >= MAX_RENEWALS ? `Already renewed ${MAX_RENEWALS} times` : 'Renew'}
                    disabled={i.renewal_count >= MAX_RENEWALS}
                    onClick={() => setRenewing(i)}
                  />
                  <IconAction icon={Undo2} label="Take back" onClick={() => setReturning(i)} />
                </>
              )}
            />
          )}
        </>
      )}

      <ReturnDialog issue={returning} onClose={() => setReturning(null)} />
      <RenewDialog issue={renewing} onClose={() => setRenewing(null)} />
    </div>
  );
}

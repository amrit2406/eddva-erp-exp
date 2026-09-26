import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookPlus, Eye, ListChecks, RefreshCw, Undo2 } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import LoanTabs from '../../components/issues/LoanTabs';
import { RenewDialog, ReturnDialog } from '../../components/loans/LoanDialogs';
import { getIssues } from '../../api/issues.api';
import { useToday } from '../../hooks/useToday';
import type { BookIssue } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { LOAN_STATE, MAX_RENEWALS, type LoanState, dueText, isOut, loanState } from '../../utils/labels';

const FILTERS: { value: string; label: string; match: (s: LoanState) => boolean }[] = [
  { value: 'out', label: 'Out now', match: (s) => s === 'on_loan' || s === 'due_soon' || s === 'overdue' },
  { value: 'due_soon', label: 'Due soon', match: (s) => s === 'due_soon' },
  { value: 'overdue', label: 'Overdue', match: (s) => s === 'overdue' },
  { value: 'returned', label: 'Returned', match: (s) => s === 'returned' },
  { value: 'all', label: 'All', match: () => true },
];

export default function ActiveIssuesListPage() {
  const today = useToday();
  const [search, setSearch] = useState('');
  const [show, setShow] = useState('out');
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState<BookIssue | null>(null);
  const [renewing, setRenewing] = useState<BookIssue | null>(null);
  const { data: issues = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    FILTERS.forEach((f) => (map[f.value] = issues.filter((i) => f.match(loanState(i, today))).length));
    return map;
  }, [issues, today]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filter = FILTERS.find((f) => f.value === show) ?? FILTERS[0];
    return issues
      .filter((i) => filter.match(loanState(i, today)))
      .filter((i) => !q || [i.copy?.book?.title, i.copy?.book?.author, i.copy?.barcode, i.member?.name, i.member?.library_card_number].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => (show === 'returned' || show === 'all' ? b.issue_date.localeCompare(a.issue_date) : a.due_date.localeCompare(b.due_date)));
  }, [issues, search, show, today]);

  const lendButton = (
    <Link to="/library/issues/desk" className={btnPrimary}>
      <BookPlus className="h-4 w-4" /> Lend a book
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load loans')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={ListChecks} title="Loans" description="Every book lent out, when it's due, and what's come back." actions={lendButton}>
        <LoanTabs overdue={counts.overdue} />
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : issues.length === 0 ? (
        <EmptyState icon={ListChecks} title="Nothing lent yet" message="Books you lend at the desk show up here with their due dates." action={lendButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by book, member, card or barcode"
            />
            <Segmented
              label="Loan status"
              value={show}
              onChange={(v) => {
                setShow(v);
                setPage(1);
              }}
              options={FILTERS.map((f) => ({ value: f.value, label: f.label, count: counts[f.value] }))}
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
              rowKey={(i) => i.issue_id}
              page={page}
              onPage={setPage}
              noun="loans"
              minWidth={820}
              columns={[
                {
                  header: 'Book',
                  cell: (i) => (
                    <div>
                      <Link to={`/library/issues/${i.issue_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {i.copy?.book?.title ?? `Copy #${i.copy_id}`}
                      </Link>
                      <p className="text-xs text-slate-500">Copy {i.copy?.barcode ?? i.copy_id}</p>
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
                      <p className="font-mono text-[11px] text-slate-500">{i.member?.library_card_number}</p>
                    </div>
                  ),
                },
                { header: 'Lent on', cell: (i) => <span className="text-slate-600">{shortDate(i.issue_date)}</span> },
                {
                  header: 'Due',
                  cell: (i) => {
                    const late = loanState(i, today) === 'overdue';
                    return (
                      <div>
                        <span className="text-slate-700">{shortDate(i.due_date)}</span>
                        <p className={`text-xs ${late ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{dueText(i, today)}</p>
                      </div>
                    );
                  },
                },
                {
                  header: 'Status',
                  cell: (i) => {
                    const s = LOAN_STATE[loanState(i, today)];
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        <StatusPill label={s.label} color={s.color} />
                        {i.renewal_count > 0 && <span className="text-[11px] text-slate-400">renewed ×{i.renewal_count}</span>}
                      </span>
                    );
                  },
                },
              ]}
              actions={(i) => (
                <>
                  <IconAction icon={Eye} label="View loan" to={`/library/issues/${i.issue_id}`} tone="brand" />
                  <IconAction
                    icon={RefreshCw}
                    label={!isOut(i) ? 'Already returned' : i.renewal_count >= MAX_RENEWALS ? `Already renewed ${MAX_RENEWALS} times` : 'Renew'}
                    disabled={!isOut(i) || i.renewal_count >= MAX_RENEWALS}
                    onClick={() => setRenewing(i)}
                  />
                  <IconAction icon={Undo2} label={isOut(i) ? 'Take back' : 'Already returned'} disabled={!isOut(i)} onClick={() => setReturning(i)} />
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

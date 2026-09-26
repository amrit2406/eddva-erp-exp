import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookCheck, BookOpen, CircleOff, Clock, IndianRupee, RefreshCw, TriangleAlert, Undo2, UserRound } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import StatusTracker, { type TrackerStep } from '../../../../components/premium/detail/StatusTracker';
import IconAction from '../../../../components/premium/list/IconAction';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import BookCover from '../../components/books/BookCover';
import { PayFineDialog, WaiveFineDialog } from '../../components/loans/FineDialogs';
import { RenewDialog, ReturnDialog } from '../../components/loans/LoanDialogs';
import { getIssue } from '../../api/issues.api';
import { getMemberFines } from '../../api/library.api';
import { useToday } from '../../hooks/useToday';
import type { Fine } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import {
  FINE_REASON,
  LOAN_STATE,
  MAX_RENEWALS,
  conditionInfo,
  daysBetween,
  dueText,
  fineIfReturnedToday,
  fineLeft,
  fineStatusInfo,
  isOut,
  loanState,
  memberTypeInfo,
} from '../../utils/labels';

export default function IssueDetailPage() {
  const { id = '' } = useParams();
  const today = useToday();
  const [returning, setReturning] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [paying, setPaying] = useState<Fine | null>(null);
  const [waiving, setWaiving] = useState<Fine | null>(null);
  const { data: issue, isLoading, error, refetch } = useQuery({ queryKey: ['library', 'issue', id], queryFn: () => getIssue(id), enabled: Boolean(id) });
  // The loan's own fines come without payments; the member's list has them.
  const { data: memberFines } = useQuery({
    queryKey: ['library', 'member-fines', String(issue?.member_id)],
    queryFn: () => getMemberFines(issue!.member_id),
    enabled: Boolean(issue?.member_id),
  });

  const back = (
    <Link to="/library/issues" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Loans
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !issue) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load loan')} onRetry={() => refetch()} />
      </div>
    );
  }

  const stateKey = loanState(issue, today);
  const state = LOAN_STATE[stateKey];
  const out = isOut(issue);
  const book = issue.copy?.book;
  const fines = memberFines ? memberFines.filter((f) => f.issue_id === issue.issue_id) : (issue.fines ?? []);
  const estimate = fineIfReturnedToday(issue, today);
  const renewalsLeft = MAX_RENEWALS - issue.renewal_count;

  const steps: TrackerStep[] = [
    { key: 'lent', label: 'Lent', icon: BookOpen, color: '#008BE9', date: shortDate(issue.issue_date) },
    { key: 'due', label: 'Due back', icon: Clock, color: '#c98500', date: shortDate(issue.due_date) },
    { key: 'returned', label: 'Returned', icon: BookCheck, color: '#15936a', date: issue.return_date ? shortDate(issue.return_date) : null },
  ];
  const current = stateKey === 'returned' ? 3 : 1;
  const stop =
    stateKey === 'overdue'
      ? { key: 'late', label: `${daysBetween(issue.due_date, today)} days late`, icon: TriangleAlert, color: '#d03b3b', date: 'Now' }
      : stateKey === 'lost'
        ? { key: 'lost', label: 'Lost', icon: CircleOff, color: '#94a3b8' }
        : undefined;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={BookOpen}
        title={book?.title ?? `Loan #${issue.issue_id}`}
        status={<StatusPill label={state.label} color={state.color} />}
        meta={`Lent to ${issue.member?.name ?? 'member'} on ${longDate(issue.issue_date)}`}
        accent={state.color}
        actions={
          out && (
            <>
              <button type="button" onClick={() => setReturning(true)} className={btnPrimary}>
                <Undo2 className="h-4 w-4" /> Take back
              </button>
              <button type="button" onClick={() => setRenewing(true)} disabled={renewalsLeft <= 0} title={renewalsLeft <= 0 ? `Already renewed ${MAX_RENEWALS} times` : undefined} className={btnSecondary}>
                <RefreshCw className="h-4 w-4" /> Renew
              </button>
            </>
          )
        }
      >
        <div className="space-y-4">
          <StatusTracker steps={steps} current={current} stop={stop} />
          {stateKey === 'returned' ? (
            <NextStep tone="good">Returned {longDate(issue.return_date)}. Nothing more to do{fines.some((f) => fineLeft(f) > 0) ? ' except the fine below' : ''}.</NextStep>
          ) : stateKey === 'overdue' ? (
            <NextStep tone="bad">
              {dueText(issue, today)}. {estimate > 0 ? `If it comes back today the fine will be ${rupees(estimate)}.` : "Still within the free days, so there's no fine yet."}
            </NextStep>
          ) : (
            <NextStep>
              {dueText(issue, today)}. {renewalsLeft > 0 ? `It can be renewed ${renewalsLeft} more time${renewalsLeft === 1 ? '' : 's'} if the member needs longer.` : 'It has been renewed the most times allowed.'}
            </NextStep>
          )}
        </div>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard title="Book" icon={BookOpen}>
          <div className="flex gap-3">
            <BookCover src={book?.cover_image_url} title={book?.title ?? 'Book'} />
            <div className="min-w-0 text-sm">
              <Link to={`/library/books/${book?.book_id ?? issue.copy?.book_id}`} className="font-semibold text-brand-navy hover:text-brand">
                {book?.title}
              </Link>
              <p className="text-slate-500">{book?.author}</p>
              <p className="mt-1 text-xs text-slate-500">
                Copy <span className="font-mono">{issue.copy?.barcode}</span>
                {issue.copy?.rack_location ? ` · shelf ${issue.copy.rack_location}` : ''}
              </p>
              {issue.copy?.condition && <p className="text-xs text-slate-500">Condition: {conditionInfo(issue.copy.condition).label}</p>}
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Member"
          icon={UserRound}
          delay={60}
          rows={[
            ['Name', <Link to={`/library/members/${issue.member_id}`} className="text-brand-navy hover:text-brand">{issue.member?.name ?? `#${issue.member_id}`}</Link>],
            ['Card', <span className="font-mono text-xs">{issue.member?.library_card_number}</span>],
            ['Type', memberTypeInfo(issue.member?.member_type).label],
          ]}
        />

        <InfoCard
          title="Loan terms"
          icon={Clock}
          delay={90}
          rows={[
            ['Due back', longDate(issue.due_date)],
            ['Renewed', `${issue.renewal_count} of ${MAX_RENEWALS} times`],
            ['Late fine', `₹${toNumber(issue.fine_per_day)} a day`],
            ['Free days', `${issue.grace_period_days ?? 0}`],
            ['Most a fine can be', issue.max_fine_cap && toNumber(issue.max_fine_cap) > 0 ? rupees(toNumber(issue.max_fine_cap)) : 'No limit'],
          ]}
        />
      </div>

      <InfoCard title={`Fines · ${fines.length}`} icon={IndianRupee} delay={120}>
        {fines.length === 0 ? (
          <p className="text-sm text-slate-500">{out && estimate > 0 ? `No fine yet — about ${rupees(estimate)} will be added when it comes back.` : 'No fines on this loan.'}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {fines.map((f) => {
              const s = fineStatusInfo(f.status);
              const left = fineLeft(f);
              return (
                <li key={f.fine_id} className="flex items-center gap-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{FINE_REASON[f.reason] ?? 'Fine'}</p>
                    <p className="text-xs text-slate-500">{shortDate(f.calculated_at)}</p>
                  </div>
                  <span className="ml-auto text-right">
                    <span className="block font-semibold tabular-nums text-slate-900">{rupees(toNumber(f.amount))}</span>
                    {left > 0 && left < toNumber(f.amount) && <span className="block text-[11px] text-slate-500">{rupees(left)} left</span>}
                  </span>
                  <StatusPill label={s.label} color={s.color} />
                  <span className="flex">
                    <IconAction icon={IndianRupee} label={left > 0 ? 'Collect payment' : 'Nothing left to pay'} disabled={left <= 0} onClick={() => setPaying(f)} />
                    <IconAction icon={CircleOff} label={left > 0 ? 'Waive fine' : 'Nothing to waive'} disabled={left <= 0} onClick={() => setWaiving(f)} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </InfoCard>

      <ReturnDialog issue={returning ? issue : null} onClose={() => setReturning(false)} />
      <RenewDialog issue={renewing ? issue : null} onClose={() => setRenewing(false)} />
      <PayFineDialog fine={paying} onClose={() => setPaying(null)} />
      <WaiveFineDialog fine={waiving} onClose={() => setWaiving(null)} />
    </div>
  );
}

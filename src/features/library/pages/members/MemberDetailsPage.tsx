import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookMarked, CircleOff, BookOpen, BookPlus, History, IdCard, IndianRupee, Pencil, UserRound } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { PayFineDialog, WaiveFineDialog } from '../../components/loans/FineDialogs';
import { RenewDialog, ReturnDialog } from '../../components/loans/LoanDialogs';
import LoanList from '../../components/loans/LoanList';
import { getIssues } from '../../api/issues.api';
import { getMember, getMemberFines, getMembershipRules } from '../../api/library.api';
import { getReservations } from '../../api/reservations.api';
import type { BookIssue, Fine } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { FINE_REASON, fineLeft, fineStatusInfo, isOut, memberStatusInfo, memberTypeInfo, memberTypePlural, reservationStatusInfo, ruleSentence } from '../../utils/labels';

// Unpaid fines at or above this stop new loans (LIBRARY_FINE_BLOCK_THRESHOLD on the server).
const FINE_BLOCK = 100;

export default function MemberDetailsPage() {
  const { id = '' } = useParams();
  const [returning, setReturning] = useState<BookIssue | null>(null);
  const [renewing, setRenewing] = useState<BookIssue | null>(null);
  const [paying, setPaying] = useState<Fine | null>(null);
  const [waiving, setWaiving] = useState<Fine | null>(null);

  const { data: member, isLoading, error, refetch } = useQuery({ queryKey: ['library', 'member', id], queryFn: () => getMember(id), enabled: Boolean(id) });
  const { data: fines = [] } = useQuery({ queryKey: ['library', 'member-fines', id], queryFn: () => getMemberFines(id), enabled: Boolean(id) });
  const { data: issues = [] } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });
  const { data: rules = [] } = useQuery({ queryKey: ['library', 'membership-rules'], queryFn: getMembershipRules });
  const { data: reservations = [] } = useQuery({ queryKey: ['library', 'reservations'], queryFn: () => getReservations() });

  const back = (
    <Link to="/library/members" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Members
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

  const type = memberTypeInfo(member.member_type);
  const status = memberStatusInfo(member.status);
  const rule = rules.find((r) => r.member_type === member.member_type);
  const theirs = issues.filter((i) => i.member_id === member.member_id).sort((a, b) => b.issue_date.localeCompare(a.issue_date));
  const current = theirs.filter(isOut);
  const history = theirs.filter((i) => !isOut(i));
  const owed = fines.reduce((sum, f) => sum + fineLeft(f), 0);
  const waiting = reservations.filter((r) => r.member_id === member.member_id && (r.status === 'pending' || r.status === 'ready_for_pickup'));
  const slotsLeft = rule ? Math.max(0, rule.max_books_allowed - current.length) : 0;

  // Why they can't borrow right now, if they can't.
  const blocker =
    member.status !== 'active'
      ? `${member.name} is ${status.label.toLowerCase()}, so they can't borrow. Edit the member to make them active again.`
      : !rule
        ? `There's no membership rule for ${memberTypePlural(member.member_type).toLowerCase()} yet, so they can't borrow.`
        : owed >= FINE_BLOCK
          ? `${member.name} owes ${rupees(owed)} in fines. New loans are blocked until it's below ${rupees(FINE_BLOCK)}.`
          : slotsLeft === 0
            ? `${member.name} already has ${current.length} book${current.length === 1 ? '' : 's'}, the most allowed. A book must come back first.`
            : null;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={UserRound}
        title={member.name}
        status={
          <>
            <StatusPill label={type.label} color={type.color} />
            <StatusPill label={status.label} color={status.color} />
          </>
        }
        meta={`Card ${member.library_card_number}${member.external_ref_id ? ` · ${member.external_ref_id}` : ''} · Member since ${longDate(member.created_at)}`}
        accent={member.status === 'active' ? undefined : status.color}
        actions={
          <>
            {!blocker && (
              <Link to={`/library/issues/desk?memberId=${member.member_id}`} className={btnPrimary}>
                <BookPlus className="h-4 w-4" /> Lend a book
              </Link>
            )}
            <Link to={`/library/members/${member.member_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      >
        {blocker ? (
          <NextStep tone="bad">{blocker}</NextStep>
        ) : (
          <NextStep tone="good">
            Can borrow {slotsLeft} more book{slotsLeft === 1 ? '' : 's'} right now.
          </NextStep>
        )}
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <InfoCard title={`Books they have · ${current.length}`} icon={BookOpen}>
            <LoanList issues={current} show="book" onReturn={setReturning} onRenew={setRenewing} empty="No books with them right now." />
          </InfoCard>

          <InfoCard title={`Fines · ${fines.length}`} icon={IndianRupee} delay={60} action={owed > 0 && <span className="text-sm font-semibold text-red-600">{rupees(owed)} to pay</span>}>
            {fines.length === 0 ? (
              <p className="text-sm text-slate-500">No fines.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {fines.map((f) => {
                  const s = fineStatusInfo(f.status);
                  const left = fineLeft(f);
                  return (
                    <li key={f.fine_id} className="flex items-center gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{FINE_REASON[f.reason] ?? 'Fine'}</p>
                        <p className="text-xs text-slate-500">
                          {shortDate(f.calculated_at)} ·{' '}
                          <Link to={`/library/issues/${f.issue_id}`} className="hover:text-brand">
                            view loan
                          </Link>
                        </p>
                      </div>
                      <span className="ml-auto whitespace-nowrap text-right">
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

          <InfoCard title={`Past loans · ${history.length}`} icon={History} delay={90}>
            <LoanList issues={history.slice(0, 8)} show="book" empty="Nothing borrowed before." />
          </InfoCard>
        </div>

        <div className="space-y-5">
          <InfoCard
            title="Borrowing rule"
            icon={IdCard}
            rows={
              rule
                ? [
                    ['Books at a time', `${rule.max_books_allowed}`],
                    ['Keep for', `${rule.loan_period_days} days`],
                    ['Late fine', `₹${toNumber(rule.fine_per_day)} a day`],
                  ]
                : undefined
            }
          >
            <p className="mt-2 text-xs text-slate-500">
              {rule ? ruleSentence(rule) : 'No rule for this member type yet. '}
              <Link to="/library/membership-rules" className="ml-1 font-medium text-brand hover:text-brand-navy">
                Membership rules
              </Link>
            </p>
          </InfoCard>
          <InfoCard title={`Waiting for · ${waiting.length}`} icon={BookMarked} delay={60}>
            {waiting.length === 0 ? (
              <p className="text-sm text-slate-500">No reservations.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {waiting.map((r) => {
                  const s = reservationStatusInfo(r.status);
                  return (
                    <li key={r.reservation_id} className="flex items-center gap-2 py-2 text-sm">
                      <Link to={`/library/books/${r.book_id}`} className="min-w-0 truncate font-medium text-brand-navy hover:text-brand">
                        {r.book?.title ?? `Book #${r.book_id}`}
                      </Link>
                      <span className="ml-auto">
                        <StatusPill label={s.label} color={s.color} title={s.hint} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoCard>
        </div>
      </div>

      <ReturnDialog issue={returning} onClose={() => setReturning(null)} />
      <RenewDialog issue={renewing} onClose={() => setRenewing(null)} />
      <PayFineDialog fine={paying} onClose={() => setPaying(null)} />
      <WaiveFineDialog fine={waiving} onClose={() => setWaiving(null)} />
    </div>
  );
}

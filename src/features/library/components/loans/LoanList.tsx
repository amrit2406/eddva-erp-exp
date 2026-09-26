import { Link } from 'react-router-dom';
import { Eye, RefreshCw, Undo2 } from 'lucide-react';
import IconAction from '../../../../components/premium/list/IconAction';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { useToday } from '../../hooks/useToday';
import type { BookIssue } from '../../types/library.types';
import { LOAN_STATE, MAX_RENEWALS, dueText, isOut, loanState } from '../../utils/labels';

interface LoanListProps {
  issues: BookIssue[];
  // Which side to name on each row: the book (on a member page) or the member (on a book page).
  show: 'book' | 'member';
  onReturn?: (issue: BookIssue) => void;
  onRenew?: (issue: BookIssue) => void;
  empty: string;
}

export default function LoanList({ issues, show, onReturn, onRenew, empty }: LoanListProps) {
  const today = useToday();
  if (issues.length === 0) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {issues.map((i) => {
        const state = LOAN_STATE[loanState(i, today)];
        const out = isOut(i);
        return (
          <li key={i.issue_id} className="flex items-center gap-3 py-2.5 text-sm">
            <div className="min-w-0">
              {show === 'book' ? (
                <Link to={`/library/issues/${i.issue_id}`} className="font-medium text-brand-navy hover:text-brand">
                  {i.copy?.book?.title ?? `Copy #${i.copy_id}`}
                </Link>
              ) : (
                <Link to={`/library/members/${i.member_id}`} className="font-medium text-brand-navy hover:text-brand">
                  {i.member?.name ?? `Member #${i.member_id}`}
                </Link>
              )}
              <p className="truncate text-xs text-slate-500">
                {show === 'book' ? i.copy?.book?.author : i.member?.library_card_number}
                {i.copy?.barcode ? ` · copy ${i.copy.barcode}` : ''}
              </p>
            </div>
            <span className="ml-auto whitespace-nowrap text-xs text-slate-500">{dueText(i, today)}</span>
            <StatusPill label={state.label} color={state.color} />
            <span className="flex items-center">
              <IconAction icon={Eye} label="View loan" to={`/library/issues/${i.issue_id}`} tone="brand" />
              {out && onRenew && (
                <IconAction
                  icon={RefreshCw}
                  label={i.renewal_count >= MAX_RENEWALS ? `Already renewed ${MAX_RENEWALS} times` : 'Renew'}
                  disabled={i.renewal_count >= MAX_RENEWALS}
                  onClick={() => onRenew(i)}
                />
              )}
              {out && onReturn && <IconAction icon={Undo2} label="Take back" onClick={() => onReturn(i)} />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

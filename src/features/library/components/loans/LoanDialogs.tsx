import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { btnPrimary, btnSecondary, longDate } from '../../../../components/premium/styles';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import { rupees } from '../../../../utils/dashboardFormat';
import { renewIssue, returnIssue } from '../../api/issues.api';
import { getMembershipRules } from '../../api/library.api';
import { useToday } from '../../hooks/useToday';
import { useLibrarianStore } from '../../stores/librarian.store';
import type { BookIssue, CopyCondition, ReturnIssueResult } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { CONDITION, MAX_RENEWALS, dueText, fineIfReturnedToday, loanState } from '../../utils/labels';

// Anything about loans, copies, members, fines or reservations may change.
const useRefreshLibrary = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['library'] });
};

function LoanSummary({ issue }: { issue: BookIssue }) {
  const today = useToday();
  const late = loanState(issue, today) === 'overdue';
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
      <p className="font-semibold text-slate-900">{issue.copy?.book?.title ?? 'Book'}</p>
      <p className="text-slate-500">
        {issue.member?.name ?? 'Member'} · copy {issue.copy?.barcode ?? `#${issue.copy_id}`}
      </p>
      <p className={`mt-1 text-xs font-medium ${late ? 'text-red-600' : 'text-slate-600'}`}>
        Due {longDate(issue.due_date)} · {dueText(issue, today)}
      </p>
    </div>
  );
}

// Take a book back: pick the condition it came back in, see any late fine first.
export function ReturnDialog({ issue, onClose, onDone }: { issue: BookIssue | null; onClose: () => void; onDone?: (result: ReturnIssueResult) => void }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const today = useToday();
  const { librarianId } = useLibrarianStore();
  const [condition, setCondition] = useState<CopyCondition>('good');

  const save = useMutation({
    mutationFn: (i: BookIssue) => returnIssue(i.issue_id, { received_by: librarianId, returned_to: librarianId, returned_condition: condition }),
    onSuccess: (result) => {
      refresh();
      const fine = result?.fine;
      toast.success(fine ? `Book taken back — a late fine of ${rupees(Number(fine.amount))} was added` : 'Book taken back');
      onDone?.(result);
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not take the book back')),
  });

  const fine = issue ? fineIfReturnedToday(issue, today) : 0;

  return (
    <Modal isOpen={issue !== null} onClose={() => !save.isPending && onClose()} title="Take the book back" size="sm">
      {issue && (
        <div className="space-y-4">
          <LoanSummary issue={issue} />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">What condition is it in?</span>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Condition">
              {(Object.keys(CONDITION) as CopyCondition[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={condition === c}
                  onClick={() => setCondition(c)}
                  className={`rounded-xl px-2 py-2 text-sm font-medium ring-1 transition ${condition === c ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {CONDITION[c].label}
                </button>
              ))}
            </div>
          </div>
          {fine > 0 ? (
            <NextStep tone="bad">It's late, so a fine of about {rupees(fine)} will be added to the member's account.</NextStep>
          ) : (
            <NextStep tone="good">Back on time — no fine.</NextStep>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="button" onClick={() => save.mutate(issue)} disabled={save.isPending} className={btnPrimary}>
              {save.isPending ? 'Saving…' : 'Take back'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// Give the member more time: the due date moves on by their loan period.
export function RenewDialog({ issue, onClose }: { issue: BookIssue | null; onClose: () => void }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const { librarianId } = useLibrarianStore();
  const { data: rules = [] } = useQuery({ queryKey: ['library', 'membership-rules'], queryFn: getMembershipRules, enabled: issue !== null });

  const save = useMutation({
    mutationFn: (i: BookIssue) => renewIssue(i.issue_id, { renewed_by: librarianId }),
    onSuccess: (updated) => {
      refresh();
      toast.success(updated?.due_date ? `Renewed — now due ${longDate(updated.due_date)}` : 'Renewed');
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not renew')),
  });

  const rule = rules.find((r) => r.member_type === issue?.member?.member_type);
  const newDue = issue && rule ? new Date(new Date(issue.due_date).getTime() + rule.loan_period_days * 86400000) : null;
  const used = issue?.renewal_count ?? 0;
  const left = MAX_RENEWALS - used;

  return (
    <Modal isOpen={issue !== null} onClose={() => !save.isPending && onClose()} title="Renew this loan" size="sm">
      {issue && (
        <div className="space-y-4">
          <LoanSummary issue={issue} />
          {left <= 0 ? (
            <NextStep tone="bad">This loan has already been renewed {MAX_RENEWALS} times, which is the limit. The book needs to come back.</NextStep>
          ) : (
            <NextStep>
              {newDue ? (
                <>
                  New due date: <strong>{longDate(newDue.toISOString())}</strong>.{' '}
                </>
              ) : null}
              {left === 1 ? 'This is the last renewal allowed.' : `It can be renewed ${left} more times.`} It can't be renewed if another member is waiting for this book.
            </NextStep>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="button" onClick={() => save.mutate(issue)} disabled={save.isPending || left <= 0} className={btnPrimary}>
              {save.isPending ? 'Renewing…' : 'Renew'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

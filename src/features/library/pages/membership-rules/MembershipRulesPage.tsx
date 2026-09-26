import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookCopy, CalendarDays, IndianRupee, Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { ListSkeleton } from '../../../../components/premium/list/ListStates';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import { deleteMembershipRule, getMembers, getMembershipRules } from '../../api/library.api';
import type { MemberType, MembershipRule } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { MEMBER_TYPE, memberTypePlural, ruleSentence } from '../../utils/labels';

const KEY = ['library', 'membership-rules'];

export default function MembershipRulesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<MembershipRule | null>(null);
  const { data: rules = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getMembershipRules });
  const { data: members = [] } = useQuery({ queryKey: ['library', 'members'], queryFn: () => getMembers() });

  const remove = useMutation({
    mutationFn: (r: MembershipRule) => deleteMembershipRule(r.rule_id),
    onSuccess: (_, r) => {
      queryClient.setQueryData<MembershipRule[]>(KEY, (current) => current?.filter((x) => x.rule_id !== r.rule_id));
      toast.success(`${MEMBER_TYPE[r.member_type]?.label ?? 'The'} rule deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this rule')),
    onSettled: () => setPendingDelete(null),
  });

  const types = Object.keys(MEMBER_TYPE) as MemberType[];
  const missing = types.filter((t) => !rules.some((r) => r.member_type === t));
  const peopleOf = (t: string) => members.filter((m) => m.member_type === t).length;

  const newButton = missing.length > 0 && (
    <Link to="/library/membership-rules/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New rule
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load membership rules')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Scale} title="Membership rules" description="How many books each kind of member can borrow, for how long, and the fine for returning late." actions={newButton} />

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {types.map((t) => {
            const rule = rules.find((r) => r.member_type === t);
            const info = MEMBER_TYPE[t];
            const people = peopleOf(t);
            if (!rule) {
              return (
                <div key={t} className="flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-dashed border-slate-200 p-5">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{memberTypePlural(t)}</p>
                    <p className="mt-1 text-sm text-slate-500">No rule yet{people ? ` — ${people} ${people === 1 ? info.label.toLowerCase() : memberTypePlural(t).toLowerCase()} can't borrow until you add one` : ''}.</p>
                  </div>
                  <Link to={`/library/membership-rules/new?type=${t}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-navy">
                    <Plus className="h-4 w-4" /> Add rule
                  </Link>
                </div>
              );
            }
            const cap = rule.max_fine_cap === null ? 0 : toNumber(rule.max_fine_cap);
            return (
              <section key={t} className="animate-rise rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: info.color }} />
                    <h2 className="text-base font-semibold text-slate-900">{memberTypePlural(t)}</h2>
                    <span className="text-xs text-slate-400">· {people} member{people === 1 ? '' : 's'}</span>
                  </div>
                  <span className="-mr-2 -mt-1 flex">
                    <IconAction icon={Pencil} label="Edit rule" to={`/library/membership-rules/${rule.rule_id}/edit`} />
                    <IconAction icon={Trash2} label="Delete rule" tone="danger" onClick={() => setPendingDelete(rule)} />
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    [BookCopy, `${rule.max_books_allowed}`, 'books'],
                    [CalendarDays, `${rule.loan_period_days}`, 'days'],
                    [IndianRupee, `₹${toNumber(rule.fine_per_day)}`, 'a late day'],
                  ].map(([Icon, value, label]) => {
                    const I = Icon as typeof BookCopy;
                    return (
                      <div key={label as string} className="rounded-2xl bg-slate-50 px-2 py-3">
                        <I className="mx-auto h-4 w-4 text-slate-400" />
                        <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{value as string}</dd>
                        <dt className="text-[11px] text-slate-500">{label as string}</dt>
                      </div>
                    );
                  })}
                </dl>
                <p className="mt-4 text-sm text-slate-600">{ruleSentence(rule)}</p>
                {cap === 0 && toNumber(rule.fine_per_day) > 0 && <p className="mt-1 text-xs text-slate-400">No upper limit on fines.</p>}
              </section>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this rule?"
        message={
          pendingDelete
            ? `${memberTypePlural(pendingDelete.member_type)} won't be able to borrow books until a new rule is added. Books already lent keep their due dates.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete rule'}
      />
    </div>
  );
}

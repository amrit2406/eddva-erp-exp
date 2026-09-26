import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getMembershipRules } from '../../api/library.api';
import type { MemberType, MembershipRuleFormData } from '../../types/library.types';
import { MEMBER_TYPE, ruleSentence } from '../../utils/labels';

interface RuleFormProps {
  defaultValues?: MembershipRuleFormData;
  ruleId?: number;
  initialType?: MemberType;
  onSubmit: (data: MembershipRuleFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

const whole = (v: string) => (v.trim() === '' ? NaN : Number(v));

export default function RuleForm({ defaultValues, ruleId, initialType, onSubmit, submitText, isSubmitting }: RuleFormProps) {
  const { data: rules = [] } = useQuery({ queryKey: ['library', 'membership-rules'], queryFn: getMembershipRules });
  const taken = new Set(rules.filter((r) => r.rule_id !== ruleId).map((r) => r.member_type));
  const firstFree = (Object.keys(MEMBER_TYPE) as MemberType[]).find((t) => !taken.has(t));

  const [type, setType] = useState<MemberType | ''>(defaultValues?.member_type ?? initialType ?? '');
  const [books, setBooks] = useState(defaultValues ? String(defaultValues.max_books_allowed) : '2');
  const [days, setDays] = useState(defaultValues ? String(defaultValues.loan_period_days) : '14');
  const [fine, setFine] = useState(defaultValues ? String(defaultValues.fine_per_day) : '5');
  const [grace, setGrace] = useState(defaultValues ? String(defaultValues.grace_period_days) : '0');
  const [cap, setCap] = useState(defaultValues ? String(defaultValues.max_fine_cap || '') : '');
  const [showErrors, setShowErrors] = useState(false);

  const chosen = type || firstFree || '';
  const v = { books: whole(books), days: whole(days), fine: whole(fine), grace: grace.trim() === '' ? 0 : whole(grace), cap: cap.trim() === '' ? 0 : whole(cap) };
  const errors = {
    type: !chosen ? 'Every member type already has a rule' : taken.has(chosen) ? 'This type already has a rule — edit that one' : undefined,
    books: !Number.isInteger(v.books) || v.books < 1 ? 'At least 1' : undefined,
    days: !Number.isInteger(v.days) || v.days < 1 ? 'At least 1 day' : undefined,
    fine: !Number.isFinite(v.fine) || v.fine < 0 ? 'Enter 0 or more' : undefined,
    grace: !Number.isInteger(v.grace) || v.grace < 0 ? 'Enter 0 or more whole days' : undefined,
    cap: !Number.isFinite(v.cap) || v.cap < 0 ? 'Enter 0 or more' : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);
  const valid = !Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setShowErrors(true);
      return;
    }
    onSubmit({ member_type: chosen as MemberType, max_books_allowed: v.books, loan_period_days: v.days, fine_per_day: v.fine, grace_period_days: v.grace, max_fine_cap: v.cap });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Who it's for">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Member type">
          {(Object.keys(MEMBER_TYPE) as MemberType[]).map((t) => {
            const isTaken = taken.has(t);
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={chosen === t}
                disabled={isTaken}
                title={isTaken ? 'Already has a rule' : undefined}
                onClick={() => setType(t)}
                className={`rounded-xl px-4 py-2 text-sm font-medium ring-1 transition disabled:cursor-not-allowed disabled:opacity-40 ${chosen === t ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
              >
                {MEMBER_TYPE[t].label}
                {isTaken && ' · has a rule'}
              </button>
            );
          })}
        </div>
        {show(errors.type) && <p className="mt-2 text-xs text-red-600">{errors.type}</p>}
      </FormCard>

      <FormCard title="Borrowing">
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <Field label="Books at a time" error={show(errors.books)}>
            <input type="number" min={1} step={1} value={books} onChange={(e) => setBooks(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Keep for (days)" error={show(errors.days)} hint="Each renewal adds the same again.">
            <input type="number" min={1} step={1} value={days} onChange={(e) => setDays(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </FormCard>

      <FormCard title="Late fine">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Per late day (₹)" error={show(errors.fine)} hint="0 means no fine.">
            <input type="number" min={0} step="0.5" value={fine} onChange={(e) => setFine(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Free days after due date" error={show(errors.grace)}>
            <input type="number" min={0} step={1} value={grace} onChange={(e) => setGrace(e.target.value)} placeholder="0" className={inputClass} />
          </Field>
          <Field label="Most a fine can be (₹)" error={show(errors.cap)} hint="Leave empty for no limit.">
            <input type="number" min={0} step={1} value={cap} onChange={(e) => setCap(e.target.value)} placeholder="No limit" className={inputClass} />
          </Field>
        </div>
      </FormCard>

      {valid && (
        <p className="rounded-2xl bg-brand/5 px-4 py-3 text-sm text-brand-navy ring-1 ring-brand/15">
          {ruleSentence({ member_type: chosen as MemberType, max_books_allowed: v.books, loan_period_days: v.days, fine_per_day: v.fine, grace_period_days: v.grace, max_fine_cap: v.cap })}
        </p>
      )}
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

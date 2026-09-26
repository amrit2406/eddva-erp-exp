import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getMembers } from '../../api/library.api';
import type { MemberFormData, MemberStatus, MemberType } from '../../types/library.types';
import { MEMBER_STATUS, MEMBER_TYPE } from '../../utils/labels';

interface MemberFormProps {
  defaultValues?: MemberFormData;
  memberId?: number;
  // Status is only changed on an existing member.
  withStatus?: boolean;
  onSubmit: (data: MemberFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

const STATUS_HINT: Record<MemberStatus, string> = {
  active: 'Can borrow books.',
  suspended: "Can't borrow until you make them active again.",
  expired: 'Membership ended — no new loans.',
};

export default function MemberForm({ defaultValues, memberId, withStatus = false, onSubmit, submitText, isSubmitting }: MemberFormProps) {
  const { data: members = [] } = useQuery({ queryKey: ['library', 'members'], queryFn: () => getMembers() });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [type, setType] = useState<MemberType>(defaultValues?.member_type ?? 'student');
  const [ref, setRef] = useState(defaultValues?.external_ref_id ?? '');
  const [status, setStatus] = useState<MemberStatus>(defaultValues?.status ?? 'active');
  const [showErrors, setShowErrors] = useState(false);

  const sameRef = ref.trim() && members.find((m) => m.member_id !== memberId && (m.external_ref_id ?? '').trim().toLowerCase() === ref.trim().toLowerCase());
  const errors = {
    name: !name.trim() ? 'Enter the name' : name.trim().length > 150 ? 'Keep it under 150 characters' : undefined,
    ref: sameRef ? `Already used by ${sameRef.name}` : undefined,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.name || errors.ref) {
      setShowErrors(true);
      return;
    }
    onSubmit({ name: name.trim(), member_type: type, external_ref_id: ref.trim() || undefined, ...(withStatus ? { status } : {}) });
  };

  const refLabel = type === 'student' ? 'Admission / roll no. (optional)' : 'Employee ID (optional)';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Full name" error={showErrors ? errors.name : undefined} className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" autoFocus={!defaultValues} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Who are they?</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Member type">
              {(Object.keys(MEMBER_TYPE) as MemberType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={type === t}
                  onClick={() => setType(t)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ring-1 transition ${type === t ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {MEMBER_TYPE[t].label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Decides how many books they can borrow and for how long (see Membership rules).</p>
          </div>
          <Field label={refLabel} error={errors.ref} hint="Links them to their school record.">
            <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. STU-1001" autoComplete="off" className={inputClass} />
          </Field>
          {!defaultValues && (
            <div className="self-end rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-500">A library card number is given automatically.</div>
          )}
        </div>
      </FormCard>

      {withStatus && (
        <FormCard title="Membership">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Status">
            {(Object.keys(MEMBER_STATUS) as MemberStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={status === s}
                onClick={() => setStatus(s)}
                className={`rounded-xl px-4 py-2 text-sm font-medium ring-1 transition ${status === s ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
              >
                {MEMBER_STATUS[s].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">{STATUS_HINT[status]}</p>
        </FormCard>
      )}
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

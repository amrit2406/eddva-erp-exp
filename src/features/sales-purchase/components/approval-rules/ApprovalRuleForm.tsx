import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Field, FormActions, FormCard, FormLoading, Toggle } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getRoles } from '../../api/roles.api';
import { getApprovalRules } from '../../api/sales-purchase.api';
import type { ApprovalRuleFormData } from '../../types/sales-purchase.types';
import { amountRange, rangesOverlap } from '../../utils/approvalRule';

interface ApprovalRuleFormProps {
  defaultValues?: ApprovalRuleFormData;
  ruleId?: number;
  onSubmit?: (data: ApprovalRuleFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

const num = (v: string) => (v === '' ? undefined : Number(v));

// Amount range + who approves + step order, read back as one sentence.
export default function ApprovalRuleForm({ defaultValues, ruleId, onSubmit, submitText = 'Save', isSubmitting = false }: ApprovalRuleFormProps) {
  const rolesQ = useQuery({ queryKey: ['sales-purchase', 'roles'], queryFn: getRoles });
  const rulesQ = useQuery({ queryKey: ['sales-purchase', 'approval-rules'], queryFn: getApprovalRules });

  const [name, setName] = useState(defaultValues?.name ?? '');
  const [min, setMin] = useState(defaultValues?.min_amount !== undefined ? String(defaultValues.min_amount) : '');
  const [max, setMax] = useState(defaultValues?.max_amount !== undefined ? String(defaultValues.max_amount) : '');
  const [noUpper, setNoUpper] = useState(defaultValues ? defaultValues.max_amount === undefined : false);
  const [roleId, setRoleId] = useState(defaultValues?.approver_role_id ?? 0);
  const [sequence, setSequence] = useState(defaultValues ? String(defaultValues.sequence) : '');
  const [active, setActive] = useState(defaultValues?.is_active ?? true);
  const [showErrors, setShowErrors] = useState(false);

  if (rolesQ.isLoading || rulesQ.isLoading) return <FormLoading />;
  const roles = rolesQ.data ?? [];
  const others = (rulesQ.data ?? []).filter((r) => r.rule_id !== ruleId);
  const nextStep = Math.max(0, ...others.map((r) => r.sequence)) + 1;
  const step = sequence === '' ? nextStep : Number(sequence);

  const minValue = num(min);
  const maxValue = noUpper ? undefined : num(max);
  const role = roles.find((r) => r.role_id === roleId);
  const overlaps = active ? others.filter((r) => r.is_active && rangesOverlap(minValue, maxValue, r.min_amount, r.max_amount)) : [];
  const sameStep = others.find((r) => r.sequence === step);

  const errors = {
    name: name.trim() ? undefined : 'Give the rule a name',
    min: minValue !== undefined && (!Number.isFinite(minValue) || minValue < 0) ? 'Enter 0 or more' : undefined,
    max: !noUpper && max === '' ? 'Enter the upper amount, or tick “No upper limit”' : maxValue !== undefined && minValue !== undefined && maxValue <= minValue ? 'Must be more than the “from” amount' : undefined,
    role: roleId ? undefined : 'Choose who approves',
    sequence: !Number.isInteger(step) || step < 1 ? 'Use a whole number from 1' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (m?: string) => (showErrors ? m : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({
      name: name.trim(),
      ...(minValue !== undefined ? { min_amount: minValue } : {}),
      ...(maxValue !== undefined ? { max_amount: maxValue } : {}),
      approver_role_id: roleId,
      sequence: step,
      is_active: active,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Which purchase orders?" description="Orders whose total falls in this range need this approval.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rule name" className="sm:col-span-3" error={show(errors.name)}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Above ₹50,000 needs the Finance Head" autoFocus className={inputClass} />
          </Field>
          <Field label="From (₹)" hint="Leave blank to start at ₹0." error={show(errors.min)}>
            <input type="number" inputMode="decimal" min="0" value={min} onChange={(e) => setMin(e.target.value)} placeholder="0" className={inputClass} />
          </Field>
          <Field label="Up to (₹)" error={show(errors.max)}>
            <input type="number" inputMode="decimal" min="0" value={noUpper ? '' : max} onChange={(e) => setMax(e.target.value)} disabled={noUpper} placeholder={noUpper ? 'No limit' : 'e.g. 200000'} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 self-center pt-5 text-sm text-slate-700">
            <input type="checkbox" checked={noUpper} onChange={(e) => setNoUpper(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
            No upper limit
          </label>
        </div>
      </FormCard>

      <FormCard title="Who approves?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Approver role" hint="Anyone with this role can approve." error={show(errors.role)}>
            <select value={roleId || ''} onChange={(e) => setRoleId(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a role</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Step" hint={`When several rules apply, lower steps approve first. Next free step: ${nextStep}.`} error={show(errors.sequence)}>
            <input type="number" inputMode="numeric" min="1" step="1" value={sequence} onChange={(e) => setSequence(e.target.value)} placeholder={String(nextStep)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Toggle label={active ? 'Rule is on' : 'Rule is off'} description="Turned-off rules are ignored when orders are sent for approval." checked={active} onChange={setActive} />
          </div>
        </div>
        {rolesQ.isError || roles.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            No roles to choose from.{' '}
            <Link to="/sales-purchase/roles/new" className="font-medium text-brand">
              Create a role
            </Link>{' '}
            (Institute Admin only).
          </p>
        ) : null}
      </FormCard>

      <div className="space-y-2">
        <p className="rounded-2xl bg-brand/5 px-4 py-3 text-sm text-slate-700 ring-1 ring-brand/15">
          Purchase orders <span className="font-semibold text-slate-900">{amountRange(minValue, maxValue).replace(/^Up to/, 'up to').replace(/^Any amount/, 'of any amount')}</span> need approval from{' '}
          <span className="font-semibold text-slate-900">{role?.name ?? '…'}</span> at step <span className="font-semibold text-slate-900">{Number.isFinite(step) ? step : '…'}</span>.
        </p>
        {overlaps.length > 0 && (
          <p className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            Overlaps with {overlaps.map((r) => `“${r.name}” (${amountRange(r.min_amount, r.max_amount)})`).join(', ')}. Orders in both ranges will need both approvals.
          </p>
        )}
        {sameStep && (
          <p className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" /> Step {step} is already used by “{sameStep.name}”.
          </p>
        )}
      </div>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

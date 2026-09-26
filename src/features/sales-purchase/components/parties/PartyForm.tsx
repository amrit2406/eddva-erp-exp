import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard, FormLoading, Toggle } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getPaymentTerms } from '../../api/sales-purchase.api';
import { emptyParty, GSTIN_PATTERN, INDIAN_STATES, PINCODE_PATTERN, type PartyValues } from '../../utils/party';
import { payWithin } from '../../utils/paymentTerm';

interface PartyFormProps {
  kind: 'vendor' | 'customer';
  defaultValues?: PartyValues;
  // Names already in use (excluding this record), for the duplicate check.
  takenNames?: string[];
  editing?: boolean;
  onSubmit: (values: PartyValues) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function PartyForm({ kind, defaultValues, takenNames = [], editing = false, onSubmit, submitText, isSubmitting }: PartyFormProps) {
  const termsQ = useQuery({ queryKey: ['sales-purchase', 'payment-terms'], queryFn: getPaymentTerms });
  const [v, setV] = useState<PartyValues>(defaultValues ?? emptyParty);
  const [showErrors, setShowErrors] = useState(false);
  const set = (patch: Partial<PartyValues>) => setV((current) => ({ ...current, ...patch }));

  if (termsQ.isLoading) return <FormLoading blocks={3} />;
  const terms = [...(termsQ.data ?? [])].sort((a, b) => a.days - b.days);
  const who = kind === 'vendor' ? 'vendor' : 'customer';

  const duplicate = takenNames.some((n) => n.trim().toLowerCase() === v.name.trim().toLowerCase());
  const errors = {
    name: !v.name.trim() ? `Enter the ${who}'s name` : duplicate ? `A ${who} called “${v.name.trim()}” already exists` : undefined,
    gstin: v.gstin && !GSTIN_PATTERN.test(v.gstin) ? 'A GSTIN has 15 characters, like 27AAPFU0939F1ZV' : undefined,
    pincode: v.pincode && !PINCODE_PATTERN.test(v.pincode) ? 'A PIN code has 6 digits' : undefined,
    credit: v.credit_limit && (!Number.isFinite(Number(v.credit_limit)) || Number(v.credit_limit) < 0) ? 'Enter an amount of 0 or more' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (m?: string) => (showErrors ? m : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit({ ...v, name: v.name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Business details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={kind === 'vendor' ? 'Vendor name' : 'Customer name'} className="sm:col-span-2" error={duplicate ? errors.name : show(errors.name)}>
            <input value={v.name} onChange={(e) => set({ name: e.target.value })} placeholder={kind === 'vendor' ? 'e.g. Bright Stationers' : 'e.g. Green Valley School'} autoFocus className={inputClass} />
          </Field>
          <Field label="GSTIN (optional)" hint="Needed for GST invoices." error={errors.gstin && (showErrors || v.gstin.length >= 15) ? errors.gstin : undefined}>
            <input value={v.gstin} onChange={(e) => set({ gstin: e.target.value.toUpperCase().replace(/\s/g, '') })} maxLength={15} placeholder="27AAPFU0939F1ZV" className={`${inputClass} font-mono`} />
          </Field>
          <Field label="PAN / Tax ID (optional)">
            <input value={v.tax_id} onChange={(e) => set({ tax_id: e.target.value.toUpperCase() })} placeholder="AAPFU0939F" className={`${inputClass} font-mono`} />
          </Field>
        </div>
      </FormCard>

      <FormCard title="Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address line 1" className="sm:col-span-2">
            <input value={v.address_line1} onChange={(e) => set({ address_line1: e.target.value })} placeholder="Building, street" className={inputClass} />
          </Field>
          <Field label="Address line 2" className="sm:col-span-2">
            <input value={v.address_line2} onChange={(e) => set({ address_line2: e.target.value })} placeholder="Area, landmark (optional)" className={inputClass} />
          </Field>
          <Field label="City">
            <input value={v.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Pune" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <input value={v.state} onChange={(e) => set({ state: e.target.value })} list="party-states" placeholder="e.g. Maharashtra" className={inputClass} />
              <datalist id="party-states">
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="PIN code" error={errors.pincode && (showErrors || v.pincode.length >= 6) ? errors.pincode : undefined}>
              <input value={v.pincode} onChange={(e) => set({ pincode: e.target.value.replace(/\D/g, '') })} inputMode="numeric" maxLength={6} placeholder="411001" className={inputClass} />
            </Field>
          </div>
        </div>
      </FormCard>

      <FormCard title="Payment">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Payment term" hint={kind === 'vendor' ? 'How long you get to pay them.' : 'How long they get to pay you.'}>
            <select value={v.payment_term_id || ''} onChange={(e) => set({ payment_term_id: Number(e.target.value) })} className={inputClass}>
              <option value="">No fixed term</option>
              {terms.map((t) => (
                <option key={t.payment_term_id} value={t.payment_term_id}>
                  {t.term_name} · {payWithin(t.days).toLowerCase()}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Credit limit (₹, optional)" hint="Highest amount that can be owed at once." error={show(errors.credit)}>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={v.credit_limit} onChange={(e) => set({ credit_limit: e.target.value })} placeholder="e.g. 100000" className={inputClass} />
          </Field>
          {editing && (
            <div className="sm:col-span-2">
              <Toggle
                label={v.active ? 'Active' : 'Inactive'}
                description={`Inactive ${who}s can't be picked on new ${kind === 'vendor' ? 'purchase orders' : 'sales orders'}.`}
                checked={v.active}
                onChange={(active) => set({ active })}
              />
            </div>
          )}
        </div>
        {terms.length === 0 && (
          <p className="mt-3 text-xs text-slate-500">
            No payment terms yet —{' '}
            <Link to="/sales-purchase/payment-terms/new" className="font-medium text-brand">
              add one
            </Link>
            .
          </p>
        )}
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getPaymentTerms } from '../../api/sales-purchase.api';
import type { PaymentTermFormData } from '../../types/sales-purchase.types';
import { payWithin, suggestTermName } from '../../utils/paymentTerm';

const QUICK_DAYS = [0, 15, 30, 45, 60];

interface PaymentTermFormProps {
  defaultValues?: PaymentTermFormData;
  termId?: number;
  onSubmit?: (data: PaymentTermFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

export default function PaymentTermForm({ defaultValues, termId, onSubmit, submitText = 'Save', isSubmitting = false }: PaymentTermFormProps) {
  const { data: terms = [] } = useQuery({ queryKey: ['sales-purchase', 'payment-terms'], queryFn: getPaymentTerms });
  const [days, setDays] = useState(defaultValues ? String(defaultValues.days) : '');
  const [name, setName] = useState(defaultValues?.term_name ?? '');
  const [nameTouched, setNameTouched] = useState(Boolean(defaultValues));
  const [showErrors, setShowErrors] = useState(false);

  const dayCount = days === '' ? NaN : Number(days);
  const effectiveName = nameTouched ? name : Number.isFinite(dayCount) ? suggestTermName(dayCount) : '';
  const duplicate = terms.find((t) => t.payment_term_id !== termId && t.term_name.trim().toLowerCase() === effectiveName.trim().toLowerCase());
  const errors = {
    days: !Number.isInteger(dayCount) || dayCount < 0 ? 'Enter a whole number of days (0 or more)' : undefined,
    name: !effectiveName.trim() ? 'Give it a name' : duplicate ? `“${duplicate.term_name}” already exists` : undefined,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.days || errors.name) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({ term_name: effectiveName.trim(), days: dayCount });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Days to pay" hint={Number.isFinite(dayCount) ? `${payWithin(dayCount)} of the invoice.` : 'Use 0 for payment on delivery.'} error={showErrors ? errors.days : undefined}>
            <input type="number" inputMode="numeric" min="0" step="1" value={days} onChange={(e) => setDays(e.target.value)} placeholder="e.g. 30" autoFocus className={inputClass} />
          </Field>
          <Field label="Name" hint={!nameTouched && effectiveName ? 'Suggested — you can change it.' : undefined} error={duplicate ? errors.name : showErrors ? errors.name : undefined}>
            <input
              value={effectiveName}
              onChange={(e) => {
                setNameTouched(true);
                setName(e.target.value);
              }}
              placeholder="e.g. Net 30"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Quick pick:</span>
          {QUICK_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(String(d))}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${dayCount === d ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
            >
              {d === 0 ? 'On delivery' : `${d} days`}
            </button>
          ))}
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

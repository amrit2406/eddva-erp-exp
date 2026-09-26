import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Lock } from 'lucide-react';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getTaxCodes } from '../../api/sales-purchase.api';
import type { TaxCodeFormData } from '../../types/sales-purchase.types';
import { formatRate, taxBreakdown } from '../../utils/taxCode';

type Mode = 'intra' | 'inter' | 'custom';

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'intra', label: 'Within the state', hint: 'Split equally into CGST + SGST' },
  { value: 'inter', label: 'Another state', hint: 'Charged fully as IGST' },
  { value: 'custom', label: 'Custom split', hint: 'Enter each part yourself' },
];

const todayIso = () => new Date().toISOString().split('T')[0];
const num = (v: string) => (v === '' ? 0 : Number(v));

interface TaxCodeFormProps {
  onSubmit?: (data: TaxCodeFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

// Pick where the trade happens and the total rate; the CGST/SGST/IGST split is done for you.
export default function TaxCodeForm({ onSubmit, submitText = 'Save', isSubmitting = false }: TaxCodeFormProps) {
  const { data: existing = [] } = useQuery({ queryKey: ['sales-purchase', 'tax-codes'], queryFn: getTaxCodes });
  const [mode, setMode] = useState<Mode>('intra');
  const [rate, setRate] = useState('');
  const [custom, setCustom] = useState({ cgst: '', sgst: '', igst: '' });
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState(todayIso());
  const [showErrors, setShowErrors] = useState(false);

  const total = num(rate);
  const split =
    mode === 'intra'
      ? { cgst_pct: total / 2, sgst_pct: total / 2, igst_pct: 0 }
      : mode === 'inter'
        ? { cgst_pct: 0, sgst_pct: 0, igst_pct: total }
        : { cgst_pct: num(custom.cgst), sgst_pct: num(custom.sgst), igst_pct: num(custom.igst) };
  const combined = split.cgst_pct + split.sgst_pct + split.igst_pct;
  const mixed = split.cgst_pct + split.sgst_pct > 0 && split.igst_pct > 0;

  const suggestedName = rate === '' && mode !== 'custom' ? '' : `${mode === 'inter' ? 'IGST' : 'GST'} ${formatRate(combined)}`;
  const effectiveName = nameTouched ? name : suggestedName;
  const duplicate = existing.find((t) => t.name.trim().toLowerCase() === effectiveName.trim().toLowerCase());

  const errors = {
    rate: mode !== 'custom' && rate === '' ? 'Enter the total tax rate' : combined < 0 || combined > 100 ? 'Rate must be between 0 and 100' : undefined,
    name: !effectiveName.trim() ? 'Give it a name' : duplicate ? `“${duplicate.name}” already exists` : undefined,
    date: effectiveFrom ? undefined : 'Pick the date it starts',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (m?: string) => (showErrors ? m : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({ name: effectiveName.trim(), ...split, effective_from: effectiveFrom });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Where does the trade happen?" description="GST is split differently for sales within your state and to other states.">
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Tax type">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={mode === m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-2xl px-4 py-3 text-left ring-1 transition ${mode === m.value ? 'bg-brand/5 ring-2 ring-brand' : 'bg-white ring-slate-200 hover:bg-slate-50'}`}
            >
              <span className="block text-sm font-semibold text-slate-900">{m.label}</span>
              <span className="block text-xs text-slate-500">{m.hint}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {mode === 'custom' ? (
            (['cgst', 'sgst', 'igst'] as const).map((k) => (
              <Field key={k} label={`${k.toUpperCase()} %`}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={custom[k]}
                  onChange={(e) => setCustom((c) => ({ ...c, [k]: e.target.value }))}
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
            ))
          ) : (
            <Field label="Total rate %" error={show(errors.rate)}>
              <input type="number" inputMode="decimal" min="0" max="100" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 18" autoFocus className={inputClass} />
            </Field>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Charges <span className="font-semibold text-slate-900">{formatRate(combined)}</span> in total · {taxBreakdown(split)}
        </p>
        {mixed && (
          <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" /> CGST, SGST and IGST are all set, so all three will be charged together. Usually it's CGST + SGST <em>or</em> IGST.
          </p>
        )}
      </FormCard>

      <FormCard title="Name and start date">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Name" hint={!nameTouched && suggestedName ? 'Suggested from the rate — you can change it.' : undefined} error={duplicate ? errors.name : show(errors.name)}>
            <input
              value={effectiveName}
              onChange={(e) => {
                setNameTouched(true);
                setName(e.target.value);
              }}
              placeholder="e.g. GST 18%"
              className={inputClass}
            />
          </Field>
          <Field label="Starts from" error={show(errors.date)}>
            <input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> The rate and start date can't be changed later, because past invoices depend on them. To change a rate, add a new tax code.
        </p>
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

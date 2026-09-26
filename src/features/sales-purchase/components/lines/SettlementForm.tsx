import { useState } from 'react';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { rupees } from '../../../../utils/dashboardFormat';

export interface SettlementInvoice {
  id: number;
  number: string;
  party: string;
  total: number;
  // Still unpaid (for an edit, this already includes the amount being edited).
  balance: number;
}

export interface SettlementValues {
  invoiceId: number;
  date: string;
  amount: number;
  mode: string;
  reference: string;
}

const MODES = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer', needsRef: true, refHint: 'UTR / transaction ID' },
  { value: 'UPI', label: 'UPI', needsRef: true, refHint: 'UPI reference' },
  { value: 'CHEQUE', label: 'Cheque', needsRef: true, refHint: 'Cheque number' },
  { value: 'CARD', label: 'Card', needsRef: false, refHint: 'Last 4 digits or approval code' },
  { value: 'CASH', label: 'Cash', needsRef: false, refHint: 'Receipt number (optional)' },
];

const todayIso = () => new Date().toISOString().split('T')[0];

interface SettlementFormProps {
  kind: 'payment' | 'receipt';
  invoices: SettlementInvoice[];
  defaultValues?: SettlementValues;
  // Pre-select this invoice (from the invoice's "Record payment" button).
  initialInvoiceId?: number;
  // Editing keeps the invoice fixed.
  lockInvoice?: boolean;
  onSubmit: (values: SettlementValues) => void;
  submitText: string;
  isSubmitting: boolean;
}

// Money paid against one invoice: which invoice, how much, when and how.
export default function SettlementForm({ kind, invoices, defaultValues, initialInvoiceId, lockInvoice = false, onSubmit, submitText, isSubmitting }: SettlementFormProps) {
  const [invoiceId, setInvoiceId] = useState(defaultValues?.invoiceId ?? initialInvoiceId ?? 0);
  const [date, setDate] = useState(defaultValues?.date?.split('T')[0] ?? todayIso());
  const [amount, setAmount] = useState(defaultValues ? String(defaultValues.amount) : '');
  const [amountTouched, setAmountTouched] = useState(Boolean(defaultValues));
  const [mode, setMode] = useState(defaultValues?.mode ?? 'BANK_TRANSFER');
  const [reference, setReference] = useState(defaultValues?.reference ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const invoice = invoices.find((i) => i.id === invoiceId);
  // Until someone types an amount, offer the full balance.
  const effectiveAmount = amountTouched ? amount : invoice ? String(invoice.balance) : '';
  const value = Number(effectiveAmount);
  const modeInfo = MODES.find((m) => m.value === mode) ?? MODES[0];
  const party = kind === 'payment' ? 'vendor' : 'customer';

  const errors = {
    invoice: invoiceId ? undefined : 'Choose the invoice this is for',
    amount: effectiveAmount === '' || !(value > 0) ? 'Enter an amount above ₹0' : invoice && value > invoice.balance + 0.005 ? `More than the ${rupees(invoice.balance)} still due` : undefined,
    date: date ? undefined : 'Pick the date',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (m?: string) => (showErrors ? m : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit({ invoiceId, date, amount: value, mode, reference: reference.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title={kind === 'payment' ? 'Which bill?' : 'Which invoice?'}>
        <Field label="Invoice" error={show(errors.invoice)}>
          <select
            value={invoiceId || ''}
            onChange={(e) => {
              setInvoiceId(Number(e.target.value));
              setAmountTouched(false);
            }}
            disabled={lockInvoice}
            className={`${inputClass} max-w-xl`}
          >
            <option value="">{invoices.length ? 'Choose an invoice' : `No posted invoices with money still due`}</option>
            {invoices.map((i) => (
              <option key={i.id} value={i.id}>
                {i.number} · {i.party} · {rupees(i.balance)} due
              </option>
            ))}
          </select>
        </Field>
        {invoice && (
          <p className="mt-3 text-sm text-slate-600">
            {invoice.party} · invoice total {rupees(invoice.total)} · <span className="font-semibold text-slate-900">{rupees(invoice.balance)} still due</span>
          </p>
        )}
      </FormCard>

      <FormCard title={kind === 'payment' ? `Payment to the ${party}` : `Money from the ${party}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (₹)" hint={!amountTouched && invoice ? 'Full balance — change it for a part payment.' : undefined} error={show(errors.amount) ?? (invoice && value > invoice.balance + 0.005 ? errors.amount : undefined)}>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={effectiveAmount}
              onChange={(e) => {
                setAmountTouched(true);
                setAmount(e.target.value);
              }}
              placeholder="0.00"
              className={inputClass}
            />
          </Field>
          <Field label={kind === 'payment' ? 'Paid on' : 'Received on'} error={show(errors.date)}>
            <input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">How</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Payment mode">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={mode === m.value}
                  onClick={() => setMode(m.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ring-1 transition ${mode === m.value ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Reference (optional)" hint={modeInfo.needsRef ? `${modeInfo.refHint} — helps trace it later.` : modeInfo.refHint}>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={modeInfo.refHint} className={`${inputClass} font-mono`} />
          </Field>
        </div>
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

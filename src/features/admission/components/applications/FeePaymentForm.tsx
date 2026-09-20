import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { formatLabel, todayInput } from '../../utils/format';
import {
  PAYMENT_MODES,
  PAYMENT_STATUSES,
  type FeePaymentFormData,
  type PaymentMode,
  type PaymentStatus,
} from '../../types/admission.types';

interface FeePaymentFormProps {
  // Application-fee payments carry a status; admission-fee payments don't.
  showStatus?: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: (data: FeePaymentFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function FeePaymentForm({ showStatus = true, submitting, error, onSubmit, onCancel }: FeePaymentFormProps) {
  const [form, setForm] = useState<FeePaymentFormData>({
    amount: '',
    payment_date: todayInput(),
    payment_mode: 'cash',
    transaction_ref: '',
    status: 'success',
  });

  const set = <K extends keyof FeePaymentFormData>(key: K, value: FeePaymentFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fee_amount" className={labelClass}>Amount (₹) *</label>
          <input
            id="fee_amount"
            type="number"
            min={0.01}
            step="0.01"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="500"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="fee_date" className={labelClass}>Payment Date *</label>
          <input
            id="fee_date"
            type="date"
            value={form.payment_date}
            onChange={(e) => set('payment_date', e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="fee_mode" className={labelClass}>Payment Mode *</label>
          <select
            id="fee_mode"
            value={form.payment_mode}
            onChange={(e) => set('payment_mode', e.target.value as PaymentMode)}
            className={`${inputClass} capitalize`}
            required
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>{formatLabel(mode)}</option>
            ))}
          </select>
        </div>

        {showStatus && (
          <div>
            <label htmlFor="fee_status" className={labelClass}>Status *</label>
            <select
              id="fee_status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as PaymentStatus)}
              className={`${inputClass} capitalize`}
              required
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="fee_ref" className={labelClass}>Transaction Reference</label>
          <input
            id="fee_ref"
            type="text"
            value={form.transaction_ref}
            onChange={(e) => set('transaction_ref', e.target.value)}
            placeholder="e.g. UPI-9081726354"
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">Recommended for card, UPI, cheque and bank payments.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}

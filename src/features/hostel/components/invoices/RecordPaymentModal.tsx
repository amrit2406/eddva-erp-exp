import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { PAYMENT_MODES } from '../../utils/invoices';
import { todayISO } from '../../utils/residents';
import type { InvoicePaymentFormData } from '../../types/hostel.types';

interface RecordPaymentModalProps {
  // Prefilled amount, when the invoice says what is still owed.
  defaultAmount?: number | null;
  onClose: () => void;
  // Should throw when the request fails so the modal can show the error.
  onSubmit: (data: InvoicePaymentFormData) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

function PaymentForm({ defaultAmount, onClose, onSubmit }: RecordPaymentModalProps) {
  const [form, setForm] = useState({
    amount_paid: defaultAmount ? String(defaultAmount) : '',
    payment_date: todayISO(),
    payment_mode: 'cash',
    transaction_ref: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount_paid);
    if (!(amount > 0)) {
      setError('Enter an amount greater than zero.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({ ...form, amount_paid: amount });
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to record payment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pay_amount" className={labelClass}>
            Amount Paid (₹) *
          </label>
          <input
            id="pay_amount"
            type="number"
            min={0.01}
            step="0.01"
            value={form.amount_paid}
            onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="pay_date" className={labelClass}>
            Payment Date *
          </label>
          <input
            id="pay_date"
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="pay_mode" className={labelClass}>
            Payment Mode *
          </label>
          <select
            id="pay_mode"
            value={form.payment_mode}
            onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
            className={`${inputClass} capitalize`}
            required
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pay_ref" className={labelClass}>
            Transaction Reference
          </label>
          <input
            id="pay_ref"
            type="text"
            value={form.transaction_ref}
            onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
            placeholder="e.g. UPI-8842913"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="pay_remarks" className={labelClass}>
            Remarks
          </label>
          <textarea
            id="pay_remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            rows={2}
            placeholder="Optional note"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}

export default function RecordPaymentModal(props: RecordPaymentModalProps) {
  return (
    <Modal isOpen onClose={props.onClose} title="Record Payment" size="lg">
      <PaymentForm {...props} />
    </Modal>
  );
}

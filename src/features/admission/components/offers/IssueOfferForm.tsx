import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { toDateTimeInput } from '../../utils/format';
import { CATEGORY_SUGGESTIONS } from '../../utils/meritLists';
import type { OfferFormData } from '../../types/admission.types';

interface IssueOfferFormProps {
  submitting: boolean;
  error: string | null;
  onSubmit: (data: OfferFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function IssueOfferForm({ submitting, error, onSubmit, onCancel }: IssueOfferFormProps) {
  const [form, setForm] = useState<OfferFormData>({ offer_expiry_date: '', seat_category: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(form.offer_expiry_date).getTime() <= Date.now()) {
      setLocalError('The offer must expire in the future.');
      return;
    }
    setLocalError(null);
    onSubmit(form);
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="offer_expiry_date" className={labelClass}>Valid Until *</label>
          <input
            id="offer_expiry_date"
            type="datetime-local"
            value={form.offer_expiry_date}
            min={toDateTimeInput(new Date().toISOString())}
            onChange={(e) => setForm({ ...form, offer_expiry_date: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="seat_category" className={labelClass}>Seat Category</label>
          <input
            id="seat_category"
            type="text"
            list="offer-seat-categories"
            value={form.seat_category}
            onChange={(e) => setForm({ ...form, seat_category: e.target.value })}
            placeholder="e.g. General"
            className={inputClass}
          />
          <datalist id="offer-seat-categories">
            {CATEGORY_SUGGESTIONS.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Issuing...' : 'Issue Offer'}
        </Button>
      </div>
    </form>
  );
}

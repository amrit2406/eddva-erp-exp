import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { SESSION_STATUSES, type SessionFormData } from '../../types/admission.types';

interface SessionFormProps {
  initialValues: SessionFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: SessionFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function SessionForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: SessionFormProps) {
  const [form, setForm] = useState<SessionFormData>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.end_date < form.start_date) {
      setLocalError('End date must not be before the start date.');
      return;
    }
    setLocalError(null);
    onSubmit({ ...form, name: form.name.trim() });
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Session Name *</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. 2027-28"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
          <input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
          <input
            id="end_date"
            type="date"
            value={form.end_date}
            min={form.start_date || undefined}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as SessionFormData['status'] })}
            className={`${inputClass} capitalize`}
          >
            {SESSION_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

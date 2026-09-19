import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { ProgramFormData } from '../../types/admission.types';

interface ProgramFormProps {
  initialValues: ProgramFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: ProgramFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const LEVEL_SUGGESTIONS = ['Pre-Primary', 'Primary', 'Middle', 'Secondary', 'Senior Secondary'];

export default function ProgramForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: ProgramFormProps) {
  const [form, setForm] = useState<ProgramFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, total_seats: Number(form.total_seats) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Program Name *</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Grade 5"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">Level *</label>
          <input
            id="level"
            type="text"
            list="program-levels"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            placeholder="e.g. Primary"
            className={inputClass}
            required
          />
          <datalist id="program-levels">
            {LEVEL_SUGGESTIONS.map((level) => (
              <option key={level} value={level} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="total_seats" className="block text-sm font-medium text-slate-700 mb-1">Total Seats *</label>
          <input
            id="total_seats"
            type="number"
            min={0}
            max={100000}
            step={1}
            value={Number.isNaN(form.total_seats) ? '' : form.total_seats}
            onChange={(e) => setForm({ ...form, total_seats: e.target.value === '' ? NaN : Number(e.target.value) })}
            placeholder="60"
            className={inputClass}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Seats available per academic session.</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="eligibility_criteria" className="block text-sm font-medium text-slate-700 mb-1">
            Eligibility Criteria
          </label>
          <textarea
            id="eligibility_criteria"
            rows={3}
            value={form.eligibility_criteria}
            onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })}
            placeholder="e.g. Completed Grade 4 with 60%+"
            className={inputClass}
          />
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

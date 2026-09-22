import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { EmploymentFormData } from '../../types/engagement.types';

interface EmploymentFormProps {
  initialValues: EmploymentFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (data: EmploymentFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function EmploymentForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: EmploymentFormProps) {
  const [form, setForm] = useState<EmploymentFormData>(initialValues);
  const set = <K extends keyof EmploymentFormData>(key: K, value: EmploymentFormData[K]) =>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="employment_company" className="block text-sm font-medium text-slate-700 mb-1">
            Company *
          </label>
          <input
            id="employment_company"
            type="text"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder="e.g. Acme Corp"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="employment_designation" className="block text-sm font-medium text-slate-700 mb-1">
            Designation *
          </label>
          <input
            id="employment_designation"
            type="text"
            value={form.designation}
            onChange={(e) => set('designation', e.target.value)}
            placeholder="e.g. Product Manager"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="employment_industry" className="block text-sm font-medium text-slate-700 mb-1">
            Industry
          </label>
          <input
            id="employment_industry"
            type="text"
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
            placeholder="e.g. Technology"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="employment_location" className="block text-sm font-medium text-slate-700 mb-1">
            Location
          </label>
          <input
            id="employment_location"
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. Bangalore"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="employment_start" className="block text-sm font-medium text-slate-700 mb-1">
            Start Date *
          </label>
          <input
            id="employment_start"
            type="date"
            value={form.start_date}
            onChange={(e) => set('start_date', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="employment_end" className="block text-sm font-medium text-slate-700 mb-1">
            End Date
          </label>
          <input
            id="employment_end"
            type="date"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
            disabled={form.is_current}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.is_current}
          onChange={(e) => set('is_current', e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        This is their current role
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

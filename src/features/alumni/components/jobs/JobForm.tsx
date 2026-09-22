import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { JobFormData } from '../../types/jobs.types';

interface JobFormProps {
  initialValues: JobFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: JobFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const JOB_TYPE_OPTIONS = ['full_time', 'part_time', 'contract', 'internship'];

export default function JobForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: JobFormProps) {
  const [form, setForm] = useState<JobFormData>(initialValues);
  const set = <K extends keyof JobFormData>(key: K, value: JobFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Job Title *
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Backend Engineer"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
            Company *
          </label>
          <input
            id="company"
            type="text"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder="e.g. Acme Corp"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. Bangalore"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="job_type" className="block text-sm font-medium text-slate-700 mb-1">
            Job Type *
          </label>
          <select
            id="job_type"
            value={form.job_type}
            onChange={(e) => set('job_type', e.target.value)}
            className={inputClass}
            required
          >
            {JOB_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
            Industry
          </label>
          <input
            id="industry"
            type="text"
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
            placeholder="e.g. Technology"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="expiry_date" className="block text-sm font-medium text-slate-700 mb-1">
            Expiry Date
          </label>
          <input
            id="expiry_date"
            type="date"
            value={form.expiry_date}
            onChange={(e) => set('expiry_date', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="posted_by_alumni_id" className="block text-sm font-medium text-slate-700 mb-1">
            Posted By (Alumni ID)
          </label>
          <input
            id="posted_by_alumni_id"
            type="number"
            min={1}
            value={form.posted_by_alumni_id}
            onChange={(e) => set('posted_by_alumni_id', e.target.value)}
            placeholder="Optional — leave blank if posted by staff"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={5}
          placeholder="We are hiring…"
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

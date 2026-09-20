import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ProgramSelect from './ProgramSelect';
import { ENQUIRY_SOURCES, type EnquiryFormData } from '../../types/admission.types';
import { formatLabel } from '../../utils/format';

interface EnquiryFormProps {
  initialValues: EnquiryFormData;
  // Assignment on an existing enquiry goes through the dedicated assign action.
  showAssignee: boolean;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: EnquiryFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function EnquiryForm({
  initialValues,
  showAssignee,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: EnquiryFormProps) {
  const [form, setForm] = useState<EnquiryFormData>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  const set = <K extends keyof EnquiryFormData>(key: K, value: EnquiryFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim() && !form.email.trim()) {
      setLocalError('Enter a phone number or an email so the enquirer can be contacted.');
      return;
    }
    setLocalError(null);
    onSubmit(form);
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className={labelClass}>Name *</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Sunita Verma"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="sunita@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="program_id" className={labelClass}>Program of Interest</label>
          <ProgramSelect
            id="program_id"
            value={form.program_id}
            onChange={(value) => set('program_id', value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="source" className={labelClass}>Source *</label>
          <select
            id="source"
            value={form.source}
            onChange={(e) => set('source', e.target.value as EnquiryFormData['source'])}
            className={`${inputClass} capitalize`}
            required
          >
            {ENQUIRY_SOURCES.map((source) => (
              <option key={source} value={source}>{formatLabel(source)}</option>
            ))}
          </select>
        </div>

        {showAssignee && (
          <div className="md:col-span-2">
            <label htmlFor="assigned_to" className={labelClass}>Assign To</label>
            <input
              id="assigned_to"
              type="text"
              value={form.assigned_to}
              onChange={(e) => set('assigned_to', e.target.value)}
              placeholder="Admission user ID"
              className={inputClass}
            />
            <p className="text-xs text-slate-500 mt-1">Optional. You can also assign later from the enquiry page.</p>
          </div>
        )}
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

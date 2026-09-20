import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ApplicationPicker from '../applications/ApplicationPicker';
import TagInput from '../common/TagInput';
import { INTERVIEW_MODES, type Application, type InterviewFormData, type InterviewMode } from '../../types/admission.types';

interface InterviewFormProps {
  // Creating picks the application; editing shows it read-only.
  mode: 'create' | 'edit';
  initialValues: InterviewFormData;
  initialApplication?: Application | null;
  applicantSummary?: string;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: InterviewFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function InterviewForm({
  mode,
  initialValues,
  initialApplication = null,
  applicantSummary,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: InterviewFormProps) {
  const [form, setForm] = useState<InterviewFormData>(initialValues);
  const [application, setApplication] = useState<Application | null>(initialApplication);
  const [localError, setLocalError] = useState<string | null>(null);

  const set = <K extends keyof InterviewFormData>(key: K, value: InterviewFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create' && !application) {
      setLocalError('Choose the application to interview.');
      return;
    }
    if (form.mode === 'offline' && !form.venue_or_link.trim()) {
      setLocalError('An offline interview needs a venue.');
      return;
    }
    setLocalError(null);
    onSubmit({ ...form, application_id: application?.application_id ?? form.application_id });
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Application {mode === 'create' && '*'}</label>
          {mode === 'create' ? (
            <ApplicationPicker value={application} onChange={setApplication} />
          ) : (
            <p className="text-slate-900 font-medium">{applicantSummary}</p>
          )}
        </div>

        <div>
          <label htmlFor="scheduled_datetime" className={labelClass}>Date & Time *</label>
          <input
            id="scheduled_datetime"
            type="datetime-local"
            value={form.scheduled_datetime}
            onChange={(e) => set('scheduled_datetime', e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="mode" className={labelClass}>Mode *</label>
          <select
            id="mode"
            value={form.mode}
            onChange={(e) => set('mode', e.target.value as InterviewMode)}
            className={`${inputClass} capitalize`}
            required
          >
            {INTERVIEW_MODES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="venue_or_link" className={labelClass}>
            {form.mode === 'offline' ? 'Venue *' : 'Meeting Link / Venue'}
          </label>
          <input
            id="venue_or_link"
            type="text"
            value={form.venue_or_link}
            onChange={(e) => set('venue_or_link', e.target.value)}
            placeholder={form.mode === 'offline' ? 'e.g. Room 12, Admin Block' : 'https://meet.example.com/...'}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="panelist_ids" className={labelClass}>Panelists</label>
          <TagInput
            id="panelist_ids"
            value={form.panelist_ids}
            onChange={(value) => set('panelist_ids', value)}
            placeholder="Type a panelist's user ID and press Enter"
          />
          <p className="text-xs text-slate-500 mt-1">Admission user IDs. Press Enter or comma after each one.</p>
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

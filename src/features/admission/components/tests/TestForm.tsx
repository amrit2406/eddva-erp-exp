import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ProgramSelect from '../enquiries/ProgramSelect';
import SessionSelect from '../sessions/SessionSelect';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { TEST_MODES, type TestFormData, type TestMode } from '../../types/admission.types';

interface TestFormProps {
  initialValues: TestFormData;
  // New tests start on the active session; existing ones keep theirs.
  defaultToActiveSession: boolean;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: TestFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function TestForm({
  initialValues,
  defaultToActiveSession,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: TestFormProps) {
  const { sessions, status: sessionsStatus, activeId } = useSessionOptions();
  const [form, setForm] = useState<TestFormData>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  const sessionId = form.session_id !== '' ? form.session_id : defaultToActiveSession ? (activeId ?? '') : '';

  const set = <K extends keyof TestFormData>(key: K, value: TestFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId === '' || form.program_id === '') {
      setLocalError('Choose an academic session and a program.');
      return;
    }
    if (form.mode === 'offline' && !form.venue.trim()) {
      setLocalError('An offline test needs a venue.');
      return;
    }
    if (form.max_marks === '' || Number(form.max_marks) <= 0) {
      setLocalError('Maximum marks must be greater than zero.');
      return;
    }
    setLocalError(null);
    onSubmit({ ...form, session_id: sessionId });
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className={labelClass}>Test Name *</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Grade 5 Entrance Test — Round 1"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="session_id" className={labelClass}>Academic Session *</label>
          <SessionSelect
            id="session_id"
            sessions={sessions}
            status={sessionsStatus}
            value={sessionId}
            onChange={(value) => set('session_id', value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="program_id" className={labelClass}>Program *</label>
          <ProgramSelect
            id="program_id"
            value={form.program_id}
            onChange={(value) => set('program_id', value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="test_date" className={labelClass}>Date & Time *</label>
          <input
            id="test_date"
            type="datetime-local"
            value={form.test_date}
            onChange={(e) => set('test_date', e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="mode" className={labelClass}>Mode *</label>
          <select
            id="mode"
            value={form.mode}
            onChange={(e) => set('mode', e.target.value as TestMode)}
            className={`${inputClass} capitalize`}
            required
          >
            {TEST_MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="venue" className={labelClass}>
            Venue{form.mode === 'offline' ? ' *' : ' / Link'}
          </label>
          <input
            id="venue"
            type="text"
            value={form.venue}
            onChange={(e) => set('venue', e.target.value)}
            placeholder={form.mode === 'offline' ? 'e.g. Main Hall, Block A' : 'Optional'}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="max_marks" className={labelClass}>Maximum Marks *</label>
          <input
            id="max_marks"
            type="number"
            min={0.01}
            step="any"
            value={form.max_marks}
            onChange={(e) => set('max_marks', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="100"
            className={inputClass}
            required
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

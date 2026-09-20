import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ProgramSelect from '../enquiries/ProgramSelect';
import SessionSelect from '../sessions/SessionSelect';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import type { FeeStructureFormData } from '../../types/admission.types';

interface FeeStructureFormProps {
  // Creating picks the session and program; editing shows them read-only.
  mode: 'create' | 'edit';
  initialValues: FeeStructureFormData;
  scopeSummary?: string;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: FeeStructureFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function FeeStructureForm({
  mode,
  initialValues,
  scopeSummary,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: FeeStructureFormProps) {
  const { sessions, status: sessionsStatus, activeId } = useSessionOptions();
  const [form, setForm] = useState<FeeStructureFormData>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  const sessionId = form.session_id !== '' ? form.session_id : mode === 'create' ? (activeId ?? '') : '';

  const set = <K extends keyof FeeStructureFormData>(key: K, value: FeeStructureFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create' && (sessionId === '' || form.program_id === '')) {
      setLocalError('Choose an academic session and a program.');
      return;
    }
    if (form.amount === '' || Number(form.amount) <= 0) {
      setLocalError('Enter an amount greater than zero.');
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
        {mode === 'create' ? (
          <>
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
          </>
        ) : (
          scopeSummary && (
            <p className="md:col-span-2 text-sm text-slate-600">
              Fee for <span className="font-medium text-slate-900">{scopeSummary}</span>. The session and program
              can't be changed — create a new fee structure for a different one.
            </p>
          )
        )}

        <div>
          <label htmlFor="amount" className={labelClass}>Amount (₹) *</label>
          <input
            id="amount"
            type="number"
            min={0.01}
            step="0.01"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="25000"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="due_date" className={labelClass}>Due Date *</label>
          <input
            id="due_date"
            type="date"
            value={form.due_date}
            onChange={(e) => set('due_date', e.target.value)}
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

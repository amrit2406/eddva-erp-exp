import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import ProgramSelect from '../enquiries/ProgramSelect';
import SessionSelect from '../sessions/SessionSelect';
import EntriesEditor from './EntriesEditor';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { validateDrafts } from '../../utils/meritLists';
import type { MeritEntryDraft, MeritListFormData } from '../../types/admission.types';

interface MeritListFormProps {
  // Creating sets session/program and can seed entries; editing changes the name/criteria only.
  mode: 'create' | 'edit';
  initialValues: MeritListFormData;
  // Read-only context shown when editing.
  scopeSummary?: string;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: MeritListFormData, entries: MeritEntryDraft[]) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function MeritListForm({
  mode,
  initialValues,
  scopeSummary,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: MeritListFormProps) {
  const { sessions, status: sessionsStatus, activeId } = useSessionOptions();
  const [form, setForm] = useState<MeritListFormData>(initialValues);
  const [entries, setEntries] = useState<MeritEntryDraft[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const sessionId = form.session_id !== '' ? form.session_id : mode === 'create' ? (activeId ?? '') : '';

  const set = <K extends keyof MeritListFormData>(key: K, value: MeritListFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Entries belong to one session and program, so changing either drops them.
  const changeScope = (patch: Partial<MeritListFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setEntries([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      if (sessionId === '' || form.program_id === '') {
        setLocalError('Choose an academic session and a program.');
        return;
      }
      const problem = validateDrafts(entries);
      if (problem) {
        setLocalError(problem);
        return;
      }
    }
    setLocalError(null);
    onSubmit({ ...form, session_id: sessionId }, entries);
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
            placeholder="e.g. Round 1"
            className={inputClass}
            required
          />
        </div>

        {mode === 'create' ? (
          <>
            <div>
              <label htmlFor="session_id" className={labelClass}>Academic Session *</label>
              <SessionSelect
                id="session_id"
                sessions={sessions}
                status={sessionsStatus}
                value={sessionId}
                onChange={(value) => changeScope({ session_id: value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="program_id" className={labelClass}>Program *</label>
              <ProgramSelect
                id="program_id"
                value={form.program_id}
                onChange={(value) => changeScope({ program_id: value })}
                className={inputClass}
                required
              />
            </div>
          </>
        ) : (
          scopeSummary && (
            <p className="md:col-span-2 text-sm text-slate-600">
              For <span className="font-medium text-slate-900">{scopeSummary}</span>. The session and program can't be
              changed once a list exists.
            </p>
          )
        )}

        <div className="md:col-span-2">
          <label htmlFor="criteria_description" className={labelClass}>Selection Criteria</label>
          <textarea
            id="criteria_description"
            rows={2}
            value={form.criteria_description}
            onChange={(e) => set('criteria_description', e.target.value)}
            placeholder="e.g. 60% entrance test, 40% interview"
            className={inputClass}
          />
        </div>
      </div>

      {mode === 'create' && (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Entries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Optional — you can also add and rank applications after creating the list.</p>
          </div>
          <EntriesEditor sessionId={sessionId} programId={form.program_id} entries={entries} onChange={setEntries} />
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

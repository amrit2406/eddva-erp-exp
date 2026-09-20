import { useState } from 'react';
import { ArrowDownUp, Plus, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ApplicationMultiPicker from '../applications/ApplicationMultiPicker';
import { OutcomeBadge } from './MeritBadges';
import { CATEGORY_SUGGESTIONS, sortDrafts } from '../../utils/meritLists';
import { MERIT_OUTCOMES, type Application, type MeritEntryDraft, type MeritOutcome } from '../../types/admission.types';

interface EntriesEditorProps {
  // Session and program scope which applications can be added.
  sessionId: number | '';
  programId: number | '';
  entries: MeritEntryDraft[];
  onChange: (entries: MeritEntryDraft[]) => void;
  readOnly?: boolean;
}

const cellInput =
  'w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function EntriesEditor({ sessionId, programId, entries, onChange, readOnly = false }: EntriesEditorProps) {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Application[]>([]);

  const update = (applicationId: number, patch: Partial<MeritEntryDraft>) =>
    onChange(entries.map((entry) => (entry.application_id === applicationId ? { ...entry, ...patch } : entry)));

  const remove = (applicationId: number) => onChange(entries.filter((entry) => entry.application_id !== applicationId));

  const addSelected = () => {
    const highest = entries.reduce((max, entry) => (typeof entry.rank === 'number' ? Math.max(max, entry.rank) : max), 0);
    const added: MeritEntryDraft[] = selected.map((application, index) => ({
      application_id: application.application_id,
      name: application.applicant?.name ?? `Applicant #${application.applicant_id}`,
      rank: highest + index + 1,
      category: '',
      outcome: 'selected',
    }));
    onChange([...entries, ...added]);
    setSelected([]);
    setAdding(false);
  };

  const canPick = sessionId !== '' && programId !== '';
  const isSorted = sortDrafts(entries).every((entry, index) => entry === entries[index]);

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            {entries.length === 0 ? 'No applications on this list yet.' : `${entries.length} on the list`}
          </p>
          <div className="flex gap-2">
            {entries.length > 1 && !isSorted && (
              <Button variant="ghost" size="sm" onClick={() => onChange(sortDrafts(entries))}>
                <ArrowDownUp className="h-4 w-4 mr-1" />
                Sort by rank
              </Button>
            )}
            {!adding && (
              <Button variant="secondary" size="sm" disabled={!canPick} onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Applications
              </Button>
            )}
          </div>
        </div>
      )}

      {!readOnly && !canPick && (
        <p className="text-sm text-slate-500">Choose a session and a program to add applications.</p>
      )}

      {adding && canPick && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
          <ApplicationMultiPicker
            sessionId={sessionId}
            programId={programId}
            excludeIds={entries.map((entry) => entry.application_id)}
            selected={selected}
            onChange={setSelected}
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setSelected([]);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" disabled={selected.length === 0} onClick={addSelected}>
              Add{selected.length ? ` (${selected.length})` : ''}
            </Button>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm font-semibold text-slate-700">
                <th className="py-2 px-3 w-24">Rank</th>
                <th className="py-2 px-3">Applicant</th>
                <th className="py-2 px-3 w-40">Category</th>
                <th className="py-2 px-3 w-40">Outcome</th>
                {!readOnly && <th className="py-2 px-3 w-12" />}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.application_id} className="border-b border-slate-100">
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="font-medium text-slate-900">{entry.rank}</span>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={entry.rank}
                        aria-label={`Rank for ${entry.name}`}
                        onChange={(e) => update(entry.application_id, { rank: e.target.value === '' ? '' : Number(e.target.value) })}
                        className={cellInput}
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-slate-900">{entry.name}</div>
                    <div className="text-xs text-slate-500">Application #{entry.application_id}</div>
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <span className="text-slate-600">{entry.category || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        list="merit-categories"
                        value={entry.category}
                        aria-label={`Category for ${entry.name}`}
                        onChange={(e) => update(entry.application_id, { category: e.target.value })}
                        placeholder="e.g. General"
                        className={cellInput}
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {readOnly ? (
                      <OutcomeBadge outcome={entry.outcome} />
                    ) : (
                      <select
                        value={entry.outcome}
                        aria-label={`Outcome for ${entry.name}`}
                        onChange={(e) => update(entry.application_id, { outcome: e.target.value as MeritOutcome })}
                        className={`${cellInput} capitalize`}
                      >
                        {MERIT_OUTCOMES.map((outcome) => (
                          <option key={outcome} value={outcome}>{outcome}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="py-2 px-3 text-right">
                      <Button variant="ghost" size="sm" title="Remove from list" onClick={() => remove(entry.application_id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="merit-categories">
            {CATEGORY_SUGGESTIONS.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      )}
    </div>
  );
}

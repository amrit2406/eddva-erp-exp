import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EntriesEditor from './EntriesEditor';
import type { MeritEntryDraft, MeritList } from '../../types/admission.types';

interface MeritEntriesPanelProps {
  list: MeritList;
  entries: MeritEntryDraft[];
  onChange: (entries: MeritEntryDraft[]) => void;
  editable: boolean;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
}

export default function MeritEntriesPanel({
  list,
  entries,
  onChange,
  editable,
  dirty,
  saving,
  error,
  onSave,
  onDiscard,
}: MeritEntriesPanelProps) {
  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Ranked Entries</h2>
          {editable && dirty && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>Discard</Button>
              <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Entries'}
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {editable && dirty && (
          <p className="text-sm text-amber-700">You have unsaved changes to the entries.</p>
        )}

        {!editable && entries.length === 0 ? (
          <div className="text-center text-slate-500 py-4">No entries on this list</div>
        ) : (
          <EntriesEditor
            sessionId={list.session_id}
            programId={list.program_id}
            entries={entries}
            onChange={onChange}
            readOnly={!editable}
          />
        )}
      </div>
    </Card>
  );
}

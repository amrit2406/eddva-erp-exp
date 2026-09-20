import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Megaphone, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import { MeritStatusBadge } from '../../components/meritLists/MeritBadges';
import MeritEntriesPanel from '../../components/meritLists/MeritEntriesPanel';
import { getMeritList, publishMeritList, replaceMeritListEntries } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import {
  MERIT_LISTS_RESOURCE,
  draftsSignature,
  isPublished,
  toDrafts,
  toPayloadEntries,
  validateDrafts,
} from '../../utils/meritLists';
import type { MeritList } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

interface MeritListBodyProps {
  list: MeritList;
  canUpdate: boolean;
  isViewOnlyAdmin: boolean;
  onChanged: () => void;
}

// Owns the entry drafts. Remounted (by key) after every reload so the drafts
// always start from what the server has.
function MeritListBody({ list, canUpdate, isViewOnlyAdmin, onChanged }: MeritListBodyProps) {
  const { toast } = useToast();
  const { nameOf: sessionName } = useSessionOptions();
  const { nameOf: programName } = useProgramOptions();
  const [initial] = useState(() => toDrafts(list.entries));
  const [entries, setEntries] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const published = isPublished(list);
  const editable = canUpdate && !published;
  const dirty = entries.some((entry) => entry.rank === '') || draftsSignature(entries) !== draftsSignature(initial);

  const handleSave = async () => {
    const problem = validateDrafts(entries);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await replaceMeritListEntries(list.merit_list_id, toPayloadEntries(entries));
      toast.success('Entries saved');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to save entries'));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm(`Publish "${list.name}"? Once published, its entries can no longer be edited here.`)) return;
    try {
      setPublishing(true);
      await publishMeritList(list.merit_list_id);
      toast.success('Merit list published');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to publish merit list'));
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = editable && !dirty && entries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{list.name}</h1>
          <MeritStatusBadge published={published} />
        </div>
        {editable && (
          <div className="flex flex-wrap gap-2">
            <Link to={`/admission/merit-lists/${list.merit_list_id}/edit`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="primary" disabled={!canPublish || publishing} onClick={handlePublish}>
              <Megaphone className="h-4 w-4 mr-2" />
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        )}
      </div>

      {!canUpdate && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      {editable && !canPublish && (
        <p className="text-sm text-slate-500">
          {entries.length === 0
            ? 'Add ranked applications before publishing.'
            : 'Save your entry changes before publishing.'}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 self-start">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
            <dl className="space-y-4">
              <Detail label="Session">
                {list.session?.name ?? sessionName(list.session_id) ?? `Session #${list.session_id}`}
              </Detail>
              <Detail label="Program">
                {list.program?.name ?? programName(list.program_id) ?? `Program #${list.program_id}`}
              </Detail>
              <Detail label="Selection Criteria">{list.criteria_description || '—'}</Detail>
              {published && list.published_at && <Detail label="Published">{formatDate(list.published_at)}</Detail>}
            </dl>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <MeritEntriesPanel
            list={list}
            entries={entries}
            onChange={setEntries}
            editable={editable}
            dirty={dirty}
            saving={saving}
            error={error}
            onSave={handleSave}
            onDiscard={() => {
              setEntries(initial);
              setError(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MeritListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(MERIT_LISTS_RESOURCE);
  const [list, setList] = useState<MeritList | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Bumped only when fresh data arrives, so the body remounts with the new
  // entries rather than with stale ones while the reload is in flight.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMeritList(id)
      .then((data) => {
        if (cancelled) return;
        setList(data);
        setVersion((v) => v + 1);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load merit list'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const backLink = (
    <Link to="/admission/merit-lists" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All merit lists
    </Link>
  );

  return (
    <div className="space-y-6">
      {backLink}
      {loadError ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{loadError}</div>
        </Card>
      ) : !list || !ready ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <MeritListBody
          key={version}
          list={list}
          canUpdate={can('update')}
          isViewOnlyAdmin={isViewOnlyAdmin}
          onChanged={() => setReloadKey((key) => key + 1)}
        />
      )}
    </div>
  );
}

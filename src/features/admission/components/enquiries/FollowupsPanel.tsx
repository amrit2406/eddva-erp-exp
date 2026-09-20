import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Pencil, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createFollowup, getFollowups, updateFollowup } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate, todayInput, toDateInput } from '../../utils/format';
import type { EnquiryFollowup, FollowupFormData } from '../../types/admission.types';

interface FollowupsPanelProps {
  enquiryId: number;
  canUpdate: boolean;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

interface FollowupFormProps {
  initialValues: FollowupFormData;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (data: FollowupFormData) => void;
  onCancel?: () => void;
}

function FollowupForm({ initialValues, submitLabel, submitting, error, onSubmit, onCancel }: FollowupFormProps) {
  const [form, setForm] = useState<FollowupFormData>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next_followup_date && form.next_followup_date < form.followup_date) {
      setLocalError('The next follow-up date must not be before this follow-up date.');
      return;
    }
    setLocalError(null);
    onSubmit(form);
  };

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {shownError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{shownError}</div>
      )}
      <div>
        <label className={labelClass}>Notes *</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="e.g. Called the parent; visiting campus on Friday"
          className={inputClass}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Follow-up Date *</label>
          <input
            type="date"
            value={form.followup_date}
            onChange={(e) => setForm({ ...form, followup_date: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Next Follow-up</label>
          <input
            type="date"
            value={form.next_followup_date}
            min={form.followup_date || undefined}
            onChange={(e) => setForm({ ...form, next_followup_date: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function FollowupsPanel({ enquiryId, canUpdate }: FollowupsPanelProps) {
  const { toast } = useToast();
  const [followups, setFollowups] = useState<EnquiryFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFollowups(enquiryId)
      .then((data) => {
        if (cancelled) return;
        setFollowups(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load follow-ups'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enquiryId, reloadKey]);

  const save = useCallback(
    async (action: () => Promise<unknown>, success: string, failure: string) => {
      try {
        setSubmitting(true);
        setError(null);
        await action();
        toast.success(success);
        setAdding(false);
        setEditingId(null);
        setReloadKey((key) => key + 1);
      } catch (err: any) {
        if (!isAuthError(err)) setError(getApiErrorMessage(err, failure));
      } finally {
        setSubmitting(false);
      }
    },
    [toast]
  );

  const newest = [...followups].sort((a, b) => b.followup_date.localeCompare(a.followup_date));

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Follow-ups</h2>
          {canUpdate && !adding && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAdding(true);
                setEditingId(null);
                setError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Follow-up
            </Button>
          )}
        </div>

        {adding && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <FollowupForm
              initialValues={{ notes: '', followup_date: todayInput(), next_followup_date: '' }}
              submitLabel="Save Follow-up"
              submitting={submitting}
              error={error}
              onSubmit={(data) => save(() => createFollowup(enquiryId, data), 'Follow-up added', 'Failed to add follow-up')}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : newest.length === 0 ? (
          <div className="text-center text-slate-500 py-4">No follow-ups recorded yet</div>
        ) : (
          <ul className="space-y-4">
            {newest.map((followup) => (
              <li key={followup.followup_id} className="border-l-2 border-slate-200 pl-4">
                {editingId === followup.followup_id ? (
                  <FollowupForm
                    initialValues={{
                      notes: followup.notes,
                      followup_date: toDateInput(followup.followup_date),
                      next_followup_date: toDateInput(followup.next_followup_date),
                    }}
                    submitLabel="Update Follow-up"
                    submitting={submitting}
                    error={error}
                    onSubmit={(data) =>
                      save(
                        () => updateFollowup(enquiryId, followup.followup_id, data),
                        'Follow-up updated',
                        'Failed to update follow-up'
                      )
                    }
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{formatDate(followup.followup_date)}</div>
                      <p className="text-slate-700 mt-1 whitespace-pre-wrap break-words">{followup.notes}</p>
                      {followup.next_followup_date && (
                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Next follow-up {formatDate(followup.next_followup_date)}
                        </p>
                      )}
                    </div>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit follow-up"
                        onClick={() => {
                          setEditingId(followup.followup_id);
                          setAdding(false);
                          setError(null);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

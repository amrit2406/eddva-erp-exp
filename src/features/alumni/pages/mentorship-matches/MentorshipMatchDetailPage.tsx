import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../../components/common/GenericDataView';
import RecordPanel from '../../components/common/RecordPanel';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import { getMentorshipMatch, getMentorshipMatchHistory, updateMentorshipMatch } from '../../api/mentorshipMatches.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// The real status enum isn't documented; "completed" comes from your sample.
const STATUS_OPTIONS = ['active', 'completed', 'ended', 'cancelled'];

export default function MentorshipMatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('mentorship_matches');
  const [match, setMatch] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const reload = async () => {
    if (!id) return;
    setMatch(await getMentorshipMatch(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMentorshipMatch(id)
      .then((data) => {
        if (!cancelled) setMatch(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load match'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadHistory = useCallback((params: ListParams) => getMentorshipMatchHistory(id!, params), [id]);

  const openModal = () => {
    setStatus(match ? recordStatus(match) ?? '' : '');
    setReason('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !status) return;
    try {
      setSubmitting(true);
      setFormError(null);
      await updateMentorshipMatch(id, { status, reason });
      toast.success('Match updated');
      setModalOpen(false);
      await reload();
      setHistoryKey((key) => key + 1);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to update match'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const mentorId = relatedId(match, 'mentor', 'mentor_id');
  const menteeId = relatedId(match, 'mentee', 'mentee_alumni_id');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/alumni/mentorship-matches"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to matches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Match #{id}</h1>
              <RecordStatusBadge status={recordStatus(match)} />
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {mentorId && (
                <Link to={`/alumni/profiles/${mentorId}`} className="text-blue-600 hover:underline">
                  View mentor
                </Link>
              )}
              {menteeId && (
                <Link to={`/alumni/profiles/${menteeId}`} className="text-blue-600 hover:underline">
                  View mentee
                </Link>
              )}
            </div>
          </div>
          {can('update') && (
            <Button variant="secondary" onClick={openModal}>
              <Pencil className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={match} emptyMessage="No details available" />
      </Card>

      <Card className="border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">History</h2>
        </div>
        <RecordPanel key={historyKey} load={loadHistory} emptyMessage="No history yet" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => !submitting && setModalOpen(false)} title="Update Match Status">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{formError}</div>
          )}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Status *
            </label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} required>
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
              Reason
            </label>
            <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={inputClass} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !status}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

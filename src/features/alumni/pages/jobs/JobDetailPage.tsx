import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Pencil, Send } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import RecordPanel from '../../components/common/RecordPanel';
import AlumniPicker from '../../components/profiles/AlumniPicker';
import { applyToJob, closeJob, getJob, getJobApplicationsForJob } from '../../api/jobs.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import { recordId } from '../../utils/records';
import type { AlumniProfile, GenericRecord, ListParams } from '../../types/profile.types';
import type { JobPosting } from '../../types/jobs.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const applicationHref = (row: GenericRecord) => {
  const id = recordId(row, 'application_id');
  return id ? `/alumni/job-applications/${id}` : undefined;
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('jobs');
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [picked, setPicked] = useState<AlumniProfile | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applicationsKey, setApplicationsKey] = useState(0);

  const reload = async () => {
    if (!id) return;
    setJob(await getJob(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getJob(id)
      .then((data) => {
        if (!cancelled) setJob(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load job'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadApplications = useCallback((params: ListParams) => getJobApplicationsForJob(id!, params), [id]);

  const handleClose = async () => {
    if (!id || !window.confirm('Close this job posting? Alumni will no longer be able to apply.')) return;
    try {
      await closeJob(id);
      toast.success('Job closed');
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to close job'));
    }
  };

  const closeApplyModal = () => {
    setApplyOpen(false);
    setPicked(null);
    setResumeUrl('');
    setCoverNote('');
    setApplyError(null);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !picked) return;
    try {
      setSubmitting(true);
      setApplyError(null);
      await applyToJob(id, { resume_url: resumeUrl, cover_note: coverNote, alumni_id: picked.profile_id });
      toast.success(`Applied on behalf of ${picked.full_name}`);
      closeApplyModal();
      setApplicationsKey((key) => key + 1);
    } catch (err) {
      setApplyError(getApiErrorMessage(err, 'Failed to submit application'));
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

  if (!job) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const isClosed = job.status?.toLowerCase() === 'closed';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/jobs" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to job board
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-slate-600 mt-1">
              {job.company} · {job.location || 'Location not specified'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isClosed && can('create') && (
              <Button variant="secondary" onClick={() => setApplyOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Apply on Behalf
              </Button>
            )}
            {!isClosed && can('update') && (
              <Link to={`/alumni/jobs/${job.job_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {!isClosed && (can('update') || can('delete')) && (
              <Button variant="ghost" onClick={handleClose}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Close Job
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Job Type</dt>
            <dd className="mt-1 text-slate-900 font-medium capitalize">{job.job_type?.replace(/_/g, ' ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Industry</dt>
            <dd className="mt-1 text-slate-900 font-medium">{job.industry || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Expires</dt>
            <dd className="mt-1 text-slate-900 font-medium">{formatValue('expiry_date', job.expiry_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-slate-900 font-medium capitalize">{job.status || '—'}</dd>
          </div>
        </dl>
        {job.description && <p className="px-4 pb-4 text-slate-600 whitespace-pre-wrap">{job.description}</p>}
      </Card>

      <Card className="border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Applications</h2>
        </div>
        <RecordPanel key={applicationsKey} load={loadApplications} emptyMessage="No applications yet" rowHref={applicationHref} />
      </Card>

      <Modal isOpen={applyOpen} onClose={() => !submitting && closeApplyModal()} title="Apply on Behalf of an Alumnus">
        <form onSubmit={handleApply} className="space-y-4">
          {applyError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{applyError}</div>
          )}
          <div>
            <label htmlFor="apply_alumni" className="block text-sm font-medium text-slate-700 mb-1">
              Alumnus *
            </label>
            <AlumniPicker id="apply_alumni" selected={picked} onSelect={setPicked} />
          </div>
          <div>
            <label htmlFor="resume_url" className="block text-sm font-medium text-slate-700 mb-1">
              Resume URL
            </label>
            <input
              id="resume_url"
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cover_note" className="block text-sm font-medium text-slate-700 mb-1">
              Cover Note
            </label>
            <textarea
              id="cover_note"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeApplyModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !picked}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Pencil, Upload } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../../components/common/GenericDataView';
import RecordPanel from '../../components/common/RecordPanel';
import {
  getJobApplication,
  getJobApplicationHistory,
  updateJobApplication,
  uploadJobApplicationResume,
  withdrawJobApplication,
} from '../../api/jobApplications.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// The real status enum isn't documented; these are a reasonable guess.
const STATUS_OPTIONS = ['applied', 'shortlisted', 'interviewing', 'rejected', 'hired'];

export default function JobApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('job_applications');
  const [application, setApplication] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const reload = async () => {
    if (!id) return;
    setApplication(await getJobApplication(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getJobApplication(id)
      .then((data) => {
        if (!cancelled) setApplication(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load application'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadHistory = useCallback((params: ListParams) => getJobApplicationHistory(id!, params), [id]);

  const openStatusModal = () => {
    setStatus(application ? recordStatus(application) ?? '' : '');
    setNotes('');
    setFormError(null);
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !status) return;
    try {
      setSubmitting(true);
      setFormError(null);
      await updateJobApplication(id, { status, notes });
      toast.success('Application updated');
      setStatusModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to update application'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!id || !window.confirm('Withdraw this application?')) return;
    try {
      await withdrawJobApplication(id);
      toast.success('Application withdrawn');
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to withdraw application'));
    }
  };

  const handleUploadResume = async () => {
    if (!id || !resumeFile) return;
    try {
      setUploadingResume(true);
      await uploadJobApplicationResume(id, resumeFile);
      toast.success('Resume uploaded');
      setResumeFile(null);
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload resume'));
    } finally {
      setUploadingResume(false);
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status_ = recordStatus(application);
  const isWithdrawn = status_ === 'withdrawn';
  const jobId = relatedId(application, 'job', 'job_id');
  const alumniId = relatedId(application, 'alumni', 'alumni_id');
  const resumeUrl = typeof application.resume_url === 'string' ? application.resume_url : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/alumni/job-applications"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to applications
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Application #{id}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {jobId && (
                <Link to={`/alumni/jobs/${jobId}`} className="text-blue-600 hover:underline">
                  View job
                </Link>
              )}
              {alumniId && (
                <Link to={`/alumni/profiles/${alumniId}`} className="text-blue-600 hover:underline">
                  View alumni profile
                </Link>
              )}
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  Open resume
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isWithdrawn && can('update') && (
              <Button variant="secondary" onClick={openStatusModal}>
                <Pencil className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            )}
            {!isWithdrawn && (can('withdraw') || can('update')) && (
              <Button variant="ghost" onClick={handleWithdraw}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Withdraw
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={application} emptyMessage="No details available" />
      </Card>

      <Card className="border-slate-200">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm font-semibold text-slate-900">Resume</p>
          <input
            type="file"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {resumeFile && (
            <Button size="sm" variant="primary" onClick={handleUploadResume} disabled={uploadingResume}>
              <Upload className="h-4 w-4 mr-2" />
              {uploadingResume ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">History</h2>
        </div>
        <RecordPanel load={loadHistory} emptyMessage="No history yet" />
      </Card>

      <Modal isOpen={statusModalOpen} onClose={() => !submitting && setStatusModalOpen(false)} title="Update Application Status">
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{formError}</div>
          )}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setStatusModalOpen(false)} disabled={submitting}>
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

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import JobForm from '../../components/jobs/JobForm';
import { getJob, updateJob } from '../../api/jobs.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { JobFormData } from '../../types/jobs.types';

export default function EditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('jobs');
  const [initial, setInitial] = useState<JobFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getJob(id)
      .then((job) => {
        if (cancelled) return;
        setInitial({
          title: job.title,
          company: job.company,
          description: job.description ?? '',
          location: job.location ?? '',
          job_type: job.job_type,
          industry: job.industry ?? '',
          expiry_date: job.expiry_date ? job.expiry_date.slice(0, 10) : '',
          posted_by_alumni_id: job.posted_by_alumni_id ? String(job.posted_by_alumni_id) : '',
        });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load job'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: JobFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateJob(id, data);
      toast.success('Job updated');
      navigate(`/alumni/jobs/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update job'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Job</h1>
        <p className="text-slate-600 mt-1">Update the job posting</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice />
          ) : (
            <JobForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Job"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/alumni/jobs/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

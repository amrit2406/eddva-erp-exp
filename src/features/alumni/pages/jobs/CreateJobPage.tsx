import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import JobForm from '../../components/jobs/JobForm';
import { createJob } from '../../api/jobs.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { JobFormData } from '../../types/jobs.types';

const EMPTY: JobFormData = {
  title: '',
  company: '',
  description: '',
  location: '',
  job_type: 'full_time',
  industry: '',
  expiry_date: '',
  posted_by_alumni_id: '',
};

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('jobs');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: JobFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const job = await createJob(data);
      toast.success('Job posted');
      navigate(`/alumni/jobs/${job.job_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to post job'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post Job</h1>
        <p className="text-slate-600 mt-1">Share a job opportunity with alumni</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <JobForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Post Job"
              submittingLabel="Posting..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/jobs')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

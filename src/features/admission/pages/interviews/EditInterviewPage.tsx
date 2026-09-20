import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import InterviewForm from '../../components/interviews/InterviewForm';
import { getInterview, updateInterview } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { toDateTimeInput } from '../../utils/format';
import { INTERVIEWS_RESOURCE, interviewApplicantName } from '../../utils/interviews';
import type { Interview, InterviewFormData } from '../../types/admission.types';

export default function EditInterviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(INTERVIEWS_RESOURCE);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getInterview(id)
      .then((data) => {
        if (!cancelled) setInterview(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load interview'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: InterviewFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateInterview(id, data);
      toast.success('Interview updated');
      navigate(`/admission/interviews/${id}`);
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update interview'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Interview</h1>
        <p className="text-slate-600 mt-1">Reschedule, change the venue or update the panel</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !interview ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <InterviewForm
              mode="edit"
              initialValues={{
                application_id: interview.application_id,
                scheduled_datetime: toDateTimeInput(interview.scheduled_datetime),
                mode: interview.mode,
                venue_or_link: interview.venue_or_link ?? '',
                panelist_ids: interview.panelist_ids ?? [],
              }}
              applicantSummary={interviewApplicantName(interview)}
              submitting={submitting}
              error={error}
              submitLabel="Update Interview"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admission/interviews/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

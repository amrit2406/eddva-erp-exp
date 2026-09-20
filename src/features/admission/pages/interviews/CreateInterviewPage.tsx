import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import InterviewForm from '../../components/interviews/InterviewForm';
import { createInterview, getApplication } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { INTERVIEWS_RESOURCE } from '../../utils/interviews';
import type { Application, InterviewFormData } from '../../types/admission.types';

const EMPTY: InterviewFormData = {
  application_id: '',
  scheduled_datetime: '',
  mode: 'offline',
  venue_or_link: '',
  panelist_ids: [],
};

export default function CreateInterviewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(INTERVIEWS_RESOURCE);
  // ?application_id=… preselects the application (used by "Schedule Interview"
  // on the application page). undefined = still loading it.
  const prefillId = params.get('application_id');
  const [prefill, setPrefill] = useState<Application | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prefillId) return;
    let cancelled = false;
    getApplication(prefillId)
      .then((application) => {
        if (!cancelled) setPrefill(application);
      })
      .catch(() => {
        if (!cancelled) setPrefill(null);
      });
    return () => {
      cancelled = true;
    };
  }, [prefillId]);

  const prefillLoading = !!prefillId && prefill === undefined;

  const handleSubmit = async (data: InterviewFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await createInterview(data);
      toast.success('Interview scheduled');
      navigate(created?.interview_id ? `/admission/interviews/${created.interview_id}` : '/admission/interviews');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to schedule interview'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schedule Interview</h1>
        <p className="text-slate-600 mt-1">Set up an interview for an application</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready || prefillLoading ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <InterviewForm
              mode="create"
              initialValues={EMPTY}
              initialApplication={prefill ?? null}
              submitting={submitting}
              error={error}
              submitLabel="Schedule Interview"
              submittingLabel="Scheduling..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/interviews')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

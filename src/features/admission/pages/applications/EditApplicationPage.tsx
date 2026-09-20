import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ApplicationForm from '../../components/applications/ApplicationForm';
import { getApplication, updateApplication } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { toDateInput } from '../../utils/format';
import type { Application, ApplicationCreateData } from '../../types/admission.types';

export default function EditApplicationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applications');
  const [application, setApplication] = useState<Application | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getApplication(id)
      .then((data) => {
        if (!cancelled) setApplication(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load application'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: ApplicationCreateData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      // Status changes go through the status action, not a plain edit.
      const { session_id, program_id, application_date } = data;
      await updateApplication(id, { session_id, program_id, application_date });
      toast.success('Application updated');
      navigate(`/admission/applications/${id}`);
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update application'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Application</h1>
        <p className="text-slate-600 mt-1">Change the session, program or application date</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !application ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <ApplicationForm
              mode="edit"
              initialValues={{
                session_id: application.session_id,
                program_id: application.program_id,
                application_date: toDateInput(application.application_date),
              }}
              applicantSummary={application.applicant?.name ?? `Applicant #${application.applicant_id}`}
              submitting={submitting}
              error={error}
              submitLabel="Update Application"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admission/applications/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

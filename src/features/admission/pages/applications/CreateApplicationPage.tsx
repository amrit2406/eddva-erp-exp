import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ApplicationForm, { type ApplicationFormValues } from '../../components/applications/ApplicationForm';
import { createApplication } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { ApplicationCreateData } from '../../types/admission.types';

const EMPTY: ApplicationFormValues = { session_id: '', program_id: '', application_date: '' };

export default function CreateApplicationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applications');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ApplicationCreateData) => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await createApplication(data);
      toast.success('Application created');
      navigate(created?.application_id ? `/admission/applications/${created.application_id}` : '/admission/applications');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create application'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Application</h1>
        <p className="text-slate-600 mt-1">Start an admission application for an applicant</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <ApplicationForm
              mode="create"
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Application"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/applications')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

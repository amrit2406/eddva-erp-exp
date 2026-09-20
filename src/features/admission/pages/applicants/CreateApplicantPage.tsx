import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ApplicantForm from '../../components/applicants/ApplicantForm';
import { createApplicant } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { ApplicantFormData } from '../../types/admission.types';

const EMPTY: ApplicantFormData = {
  name: '',
  dob: '',
  gender: 'male',
  email: '',
  phone: '',
  address: '',
  guardian_name: '',
  guardian_contact: '',
  photo_url: '',
};

export default function CreateApplicantPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applicants');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ApplicantFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createApplicant(data);
      toast.success('Applicant created');
      navigate('/admission/applicants');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create applicant'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Applicant</h1>
        <p className="text-slate-600 mt-1">Register a new admission applicant</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <ApplicantForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Applicant"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/applicants')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

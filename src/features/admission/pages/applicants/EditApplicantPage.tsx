import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ApplicantForm from '../../components/applicants/ApplicantForm';
import { getApplicant, updateApplicant } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { toDateInput } from '../../utils/format';
import type { ApplicantFormData } from '../../types/admission.types';

export default function EditApplicantPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applicants');
  const [initial, setInitial] = useState<ApplicantFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getApplicant(id)
      .then((applicant) => {
        if (cancelled) return;
        setInitial({
          name: applicant.name,
          dob: toDateInput(applicant.dob),
          gender: applicant.gender,
          email: applicant.email ?? '',
          phone: applicant.phone ?? '',
          address: applicant.address ?? '',
          guardian_name: applicant.guardian_name ?? '',
          guardian_contact: applicant.guardian_contact ?? '',
          photo_url: applicant.photo_url ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load applicant'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: ApplicantFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateApplicant(id, data);
      toast.success('Applicant updated');
      navigate('/admission/applicants');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update applicant'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Applicant</h1>
        <p className="text-slate-600 mt-1">Update the applicant's personal or guardian details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <ApplicantForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Applicant"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/applicants')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

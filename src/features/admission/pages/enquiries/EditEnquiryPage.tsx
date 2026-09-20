import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import EnquiryForm from '../../components/enquiries/EnquiryForm';
import { getEnquiry, updateEnquiry } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { EnquiryFormData } from '../../types/admission.types';

export default function EditEnquiryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('enquiries');
  const [initial, setInitial] = useState<EnquiryFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getEnquiry(id)
      .then((enquiry) => {
        if (cancelled) return;
        setInitial({
          name: enquiry.name,
          phone: enquiry.phone ?? '',
          email: enquiry.email ?? '',
          program_id: enquiry.program_id ?? '',
          source: enquiry.source,
          assigned_to: enquiry.assigned_to ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load enquiry'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: EnquiryFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      // Assignment is changed through the assign action, not a plain edit.
      const { name, phone, email, program_id, source } = data;
      await updateEnquiry(id, { name, phone, email, program_id, source });
      toast.success('Enquiry updated');
      navigate(`/admission/enquiries/${id}`);
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update enquiry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Enquiry</h1>
        <p className="text-slate-600 mt-1">Update the enquirer's details</p>
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
            <EnquiryForm
              initialValues={initial}
              showAssignee={false}
              submitting={submitting}
              error={error}
              submitLabel="Update Enquiry"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admission/enquiries/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

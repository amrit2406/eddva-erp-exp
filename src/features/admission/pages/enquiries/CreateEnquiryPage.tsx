import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import EnquiryForm from '../../components/enquiries/EnquiryForm';
import { createEnquiry } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { EnquiryFormData } from '../../types/admission.types';

const EMPTY: EnquiryFormData = {
  name: '',
  phone: '',
  email: '',
  program_id: '',
  source: 'walk_in',
  assigned_to: '',
};

export default function CreateEnquiryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('enquiries');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EnquiryFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createEnquiry(data);
      toast.success('Enquiry created');
      navigate('/admission/enquiries');
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create enquiry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Enquiry</h1>
        <p className="text-slate-600 mt-1">Record a new enquiry or lead</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : (
            <EnquiryForm
              initialValues={EMPTY}
              showAssignee
              submitting={submitting}
              error={error}
              submitLabel="Create Enquiry"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admission/enquiries')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

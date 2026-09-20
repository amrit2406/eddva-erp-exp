import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ConvertEnquiryForm from '../../components/enquiries/ConvertEnquiryForm';
import { convertEnquiry, getEnquiry } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { ConvertEnquiryData, Enquiry } from '../../types/admission.types';

export default function ConvertEnquiryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('enquiries');
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getEnquiry(id)
      .then((data) => {
        if (!cancelled) setEnquiry(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load enquiry'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: ConvertEnquiryData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await convertEnquiry(id, data);
      toast.success('Enquiry converted to an application');
      navigate(`/admission/enquiries/${id}`);
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to convert enquiry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Convert to Application</h1>
        <p className="text-slate-600 mt-1">
          {enquiry ? `Create an application for ${enquiry.name}` : 'Create an application from this enquiry'}
        </p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !enquiry ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />
          ) : enquiry.status === 'converted' ? (
            <div className="text-center text-slate-600 py-4">This enquiry has already been converted.</div>
          ) : (
            <ConvertEnquiryForm
              enquiry={enquiry}
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admission/enquiries/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

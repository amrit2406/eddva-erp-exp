import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryForm from '../../components/enquiries/EnquiryForm';
import { getEnquiry, updateEnquiry } from '../../api/enquiries.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeEnquiryFormData } from '../../types/enquiryRecord.types';

export default function EditEnquiryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FrontOfficeEnquiryFormData>({
    enquirer_name: '',
    phone: '',
    email: '',
    source: 'walk_in',
    category: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getEnquiry(id);
      setFormData({
        enquirer_name: data.enquirer_name,
        phone: data.phone ?? '',
        email: data.email ?? '',
        source: data.source,
        category: data.category,
        description: data.description,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load enquiry'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateEnquiry(id, formData);
      navigate(`/front-office/enquiries/${id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update enquiry'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Enquiry</h1>
          <p className="text-slate-600 mt-1">Update enquiry information</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to={`/front-office/enquiries/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Enquiry</h1>
          <p className="text-slate-600 mt-1">Update enquiry information</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <p className="text-xs text-slate-500 mb-4">
            Assignment and status are managed separately — use the Assign and Change Status actions on the enquiry detail page.
          </p>
          <EnquiryForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/front-office/enquiries/${id}`)}
            submitText="Update Enquiry"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

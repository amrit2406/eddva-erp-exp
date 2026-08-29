import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VisitorForm from '../../components/visitors/VisitorForm';
import { getVisitor, updateVisitor } from '../../api/visitors.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeVisitorFormData } from '../../types/visitorRecord.types';

export default function EditVisitorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FrontOfficeVisitorFormData>({
    full_name: '',
    phone: '',
    email: '',
    id_proof_type: '',
    id_proof_number: '',
    photo_url: '',
    organization: '',
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
      const data = await getVisitor(id);
      setFormData({
        full_name: data.full_name,
        phone: data.phone ?? '',
        email: data.email ?? '',
        id_proof_type: data.id_proof_type ?? '',
        id_proof_number: data.id_proof_number ?? '',
        photo_url: data.photo_url ?? '',
        organization: data.organization ?? '',
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load visitor'));
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
      await updateVisitor(id, formData);
      navigate(`/front-office/visitors/${id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update visitor'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Visitor</h1>
          <p className="text-slate-600 mt-1">Update visitor information</p>
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
        <Link to={`/front-office/visitors/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Visitor</h1>
          <p className="text-slate-600 mt-1">Update visitor information</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <VisitorForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/front-office/visitors/${id}`)}
            submitText="Update Visitor"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

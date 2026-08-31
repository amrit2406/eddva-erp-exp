import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import { getComplaint, updateComplaint } from '../../api/complaints.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { ComplaintFormData } from '../../types/complaintRecord.types';

export default function EditComplaintPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<ComplaintFormData>({
    complainant_name: '',
    phone: '',
    email: '',
    category: '',
    description: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getComplaint(id);
      setFormData({
        complainant_name: data.complainant_name,
        phone: data.phone ?? '',
        email: data.email ?? '',
        category: data.category,
        description: data.description,
        priority: data.priority,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load complaint'));
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
      await updateComplaint(id, formData);
      navigate(`/front-office/complaints/${id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update complaint'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Complaint</h1>
          <p className="text-slate-600 mt-1">Update complaint information</p>
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
        <Link to={`/front-office/complaints/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Complaint</h1>
          <p className="text-slate-600 mt-1">Update complaint information</p>
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
            Priority, assignment, and status are managed separately — use the actions on the complaint detail page.
          </p>
          <ComplaintForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/front-office/complaints/${id}`)}
            submitText="Update Complaint"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

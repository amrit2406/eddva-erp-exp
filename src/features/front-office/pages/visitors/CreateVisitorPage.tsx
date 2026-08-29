import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VisitorForm from '../../components/visitors/VisitorForm';
import { createVisitor } from '../../api/visitors.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeVisitorFormData } from '../../types/visitorRecord.types';

export default function CreateVisitorPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FrontOfficeVisitorFormData>({
    full_name: '',
    phone: '',
    email: '',
    id_proof_type: '',
    id_proof_number: '',
    photo_url: '',
    organization: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createVisitor(formData);
      navigate('/front-office/visitors');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create visitor'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/front-office/visitors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Register New Visitor</h1>
          <p className="text-slate-600 mt-1">Add a new visitor to the system</p>
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
            onCancel={() => navigate('/front-office/visitors')}
            submitText="Register Visitor"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

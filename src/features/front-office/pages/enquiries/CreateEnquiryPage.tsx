import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryForm from '../../components/enquiries/EnquiryForm';
import { createEnquiry } from '../../api/enquiries.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeEnquiryFormData } from '../../types/enquiryRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

export default function CreateEnquiryPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [formData, setFormData] = useState<FrontOfficeEnquiryFormData>({
    enquirer_name: '',
    phone: '',
    email: '',
    source: 'walk_in',
    category: '',
    description: '',
    assigned_to: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmployees({ limit: 100 }).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createEnquiry(formData);
      navigate('/front-office/enquiries');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create enquiry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/front-office/enquiries">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Enquiry</h1>
          <p className="text-slate-600 mt-1">Create a new enquiry record</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <EnquiryForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/front-office/enquiries')}
            employees={employees}
            showAssignee
            submitText="Create Enquiry"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

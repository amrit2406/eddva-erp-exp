import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import { createComplaint } from '../../api/complaints.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { ComplaintFormData } from '../../types/complaintRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

export default function CreateComplaintPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [formData, setFormData] = useState<ComplaintFormData>({
    complainant_name: '',
    phone: '',
    email: '',
    category: '',
    description: '',
    priority: 'medium',
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
      const complaint = await createComplaint(formData);
      navigate(`/front-office/complaints/${complaint.complaint_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create complaint'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/front-office/complaints">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Complaint</h1>
          <p className="text-slate-600 mt-1">Create a new complaint record</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <ComplaintForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/front-office/complaints')}
            employees={employees}
            showPriorityAndAssignee
            submitText="Create Complaint"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

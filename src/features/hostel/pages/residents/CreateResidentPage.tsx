import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ResidentForm from '../../components/residents/ResidentForm';
import { createResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { todayISO } from '../../utils/residents';
import type { ResidentFormData } from '../../types/hostel.types';

export default function CreateResidentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('residents');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial: ResidentFormData = {
    student_ref: '',
    admission_no: '',
    student_name: '',
    gender: '',
    grade: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    admitted_on: todayISO(),
  };

  const handleSubmit = async (data: ResidentFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const resident = await createResident(data);
      toast.success('Resident added');
      navigate(Number.isNaN(resident.resident_id) ? '/hostel/residents' : `/hostel/residents/${resident.resident_id}`);
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to add resident'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Resident</h1>
        <p className="text-slate-600 mt-1">Register a student as a hostel resident</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <ResidentForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Add Resident"
              submittingLabel="Adding..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/residents')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

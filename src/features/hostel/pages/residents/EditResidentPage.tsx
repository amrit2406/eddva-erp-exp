import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ResidentForm from '../../components/residents/ResidentForm';
import { getResident, updateResident } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { ResidentFormData } from '../../types/hostel.types';

export default function EditResidentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('residents');
  const [initial, setInitial] = useState<ResidentFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getResident(id)
      .then((resident) => {
        if (cancelled) return;
        setInitial({
          student_ref: resident.student_ref,
          admission_no: resident.admission_no,
          student_name: resident.student_name,
          gender: resident.gender,
          grade: resident.grade ?? '',
          guardian_name: resident.guardian_name ?? '',
          guardian_phone: resident.guardian_phone ?? '',
          guardian_email: resident.guardian_email ?? '',
          admitted_on: resident.admitted_on?.slice(0, 10) ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load resident'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: ResidentFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateResident(id, data);
      toast.success('Resident updated');
      navigate(`/hostel/residents/${id}`);
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update resident'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Resident</h1>
        <p className="text-slate-600 mt-1">Update student and guardian details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice />
          ) : (
            <ResidentForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Resident"
              submittingLabel="Updating..."
              lockIdentity
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/hostel/residents/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

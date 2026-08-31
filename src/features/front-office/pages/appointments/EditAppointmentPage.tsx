import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentUpdateForm from '../../components/appointments/AppointmentUpdateForm';
import { getAppointment, updateAppointment } from '../../api/appointments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { AppointmentUpdateFormData } from '../../types/appointmentRecord.types';

export default function EditAppointmentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<AppointmentUpdateFormData>({
    visitor_id: undefined,
    visitor_name: '',
    phone: '',
    purpose: '',
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
      const data = await getAppointment(id);
      setFormData({
        visitor_id: data.visitor_id ?? undefined,
        visitor_name: data.visitor_name,
        phone: data.phone ?? '',
        purpose: data.purpose ?? '',
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load appointment'));
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
      await updateAppointment(id, formData);
      navigate(`/front-office/appointments/${id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update appointment'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Appointment</h1>
          <p className="text-slate-600 mt-1">Update appointment information</p>
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
        <Link to={`/front-office/appointments/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Appointment</h1>
          <p className="text-slate-600 mt-1">Update visitor details for this appointment</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <AppointmentUpdateForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/front-office/appointments/${id}`)}
            submitText="Update Appointment"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}

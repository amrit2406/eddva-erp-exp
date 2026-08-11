import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { mockAppointments } from '../../mock/appointments.mock';

export default function EditAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const appointment = mockAppointments.find((a) => a.id === id);

  const handleSubmit = (data: any) => {
    console.log('Update appointment:', id, data);
    // Will be connected to API later
  };

  if (!appointment) {
    return (
      <div className="text-center py-8 text-slate-500">
        Appointment not found
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
          <p className="text-slate-600 mt-1">Update appointment information</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <AppointmentForm
            defaultValues={appointment}
            onSubmit={handleSubmit}
            submitText="Update Appointment"
          />
        </div>
      </Card>
    </div>
  );
}

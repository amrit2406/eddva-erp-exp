import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import AppointmentDetails from '../../components/appointments/AppointmentDetails';
import AppointmentStatusActions from '../../components/appointments/AppointmentStatusActions';
import { mockAppointments } from '../../mock/appointments.mock';
import { useState } from 'react';

export default function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const appointment = mockAppointments.find((a) => a.id === id);
  const [status, setStatus] = useState(appointment?.status || 'scheduled');

  const handleStatusChange = (newStatus: string) => {
    console.log('Change status:', id, newStatus);
    setStatus(newStatus as any);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to="/front-office/appointments">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Details</h1>
            <p className="text-slate-600 mt-1">View appointment information</p>
          </div>
        </div>
        <AppointmentStatusActions currentStatus={status} onStatusChange={handleStatusChange} />
      </div>

      <AppointmentDetails appointmentId={id || ''} />
    </div>
  );
}

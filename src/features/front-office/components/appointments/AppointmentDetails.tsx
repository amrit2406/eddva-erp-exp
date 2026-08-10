import { mockAppointments } from '../../mock/appointments.mock';
import RecordDetails from '../common/RecordDetails';
import { cn } from '../../../../utils/cn';

interface AppointmentDetailsProps {
  appointmentId: string;
  className?: string;
}

export default function AppointmentDetails({ appointmentId, className }: AppointmentDetailsProps) {
  const appointment = mockAppointments.find((a) => a.id === appointmentId);

  if (!appointment) {
    return <div className={cn('text-center py-8 text-slate-500', className)}>Appointment not found</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <RecordDetails
        title="Appointment Information"
        details={[
          { label: 'Appointment Number', value: appointment.appointmentNumber },
          { label: 'Visitor Name', value: appointment.visitorName },
          { label: 'Visitor Phone', value: appointment.visitorPhone },
          { label: 'Host Employee', value: appointment.hostEmployeeName },
          { label: 'Appointment Date', value: new Date(appointment.appointmentDate).toLocaleDateString() },
          { label: 'Time', value: `${appointment.startTime} - ${appointment.endTime}` },
          { label: 'Purpose', value: appointment.purpose },
          { label: 'Status', value: appointment.status.replace('_', ' ') },
          { label: 'Notes', value: appointment.notes || '-' },
          { label: 'Created At', value: new Date(appointment.createdAt).toLocaleString() },
        ]}
      />
    </div>
  );
}

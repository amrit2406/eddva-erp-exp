import RecordDetails from '../common/RecordDetails';
import { cn } from '../../../../utils/cn';
import { formatDateDisplay, toTimeInputValue } from '../../utils/dateTime';
import type { FrontOfficeAppointment } from '../../types/appointmentRecord.types';

interface AppointmentDetailsProps {
  appointment: FrontOfficeAppointment;
  className?: string;
}

export default function AppointmentDetails({ appointment, className }: AppointmentDetailsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <RecordDetails
        title="Appointment Information"
        details={[
          { label: 'Visitor Name', value: appointment.visitor_name },
          { label: 'Phone', value: appointment.phone || '—' },
          { label: 'Host Employee', value: appointment.host_employee?.name || '—' },
          { label: 'Department', value: appointment.department?.name || '—' },
          { label: 'Appointment Date', value: formatDateDisplay(appointment.appointment_date) },
          { label: 'Time', value: `${toTimeInputValue(appointment.start_time)} - ${toTimeInputValue(appointment.end_time)}` },
          { label: 'Purpose', value: appointment.purpose || '—' },
          { label: 'Status', value: appointment.status.replace('_', ' ') },
          { label: 'Notes', value: appointment.notes || '—' },
          ...(appointment.cancellation_reason
            ? [{ label: 'Cancellation Reason', value: appointment.cancellation_reason }]
            : []),
          { label: 'Created At', value: appointment.created_at ? new Date(appointment.created_at).toLocaleString() : '—' },
        ]}
      />
    </div>
  );
}

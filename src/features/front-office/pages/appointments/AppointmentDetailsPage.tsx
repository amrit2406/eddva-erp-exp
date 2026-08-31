import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import StatusBadge from '../../components/common/StatusBadge';
import AppointmentDetails from '../../components/appointments/AppointmentDetails';
import AppointmentStatusActions from '../../components/appointments/AppointmentStatusActions';
import CancelAppointmentModal from '../../components/appointments/CancelAppointmentModal';
import CompleteAppointmentModal from '../../components/appointments/CompleteAppointmentModal';
import RescheduleAppointmentModal from '../../components/appointments/RescheduleAppointmentModal';
import { useToast } from '../../../../hooks/useToast';
import {
  getAppointment,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  markAppointmentNoShow,
  rescheduleAppointment,
} from '../../api/appointments.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { formatDateDisplay, toTimeInputValue } from '../../utils/dateTime';
import type {
  FrontOfficeAppointment,
  CancelAppointmentFormData,
  CompleteAppointmentFormData,
  RescheduleAppointmentFormData,
} from '../../types/appointmentRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

export default function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<FrontOfficeAppointment | null>(null);
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
    getEmployees({ limit: 100 }).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getAppointment(id);
      setAppointment(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load appointment'));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await confirmAppointment(id);
      toast.success('Appointment confirmed.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to confirm appointment'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNoShow() {
    if (!id) return;
    if (!window.confirm('Mark this appointment as a no-show?')) return;
    setIsSubmitting(true);
    try {
      await markAppointmentNoShow(id);
      toast.success('Appointment marked as no-show.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark no-show'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(data: CancelAppointmentFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await cancelAppointment(id, data);
      toast.success('Appointment cancelled.');
      setIsCancelOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete(data: CompleteAppointmentFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await completeAppointment(id, data);
      toast.success('Appointment marked completed.');
      setIsCompleteOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReschedule(data: RescheduleAppointmentFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await rescheduleAppointment(id, data);
      toast.success('Appointment rescheduled.');
      setIsRescheduleOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!appointment) {
    return <div className="text-center py-8 text-slate-500">Appointment not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/appointments" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Appointments
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {appointment.visitor_name}
            <StatusBadge status={appointment.status} variant="appointment" />
          </h1>
          <p className="text-slate-600 mt-1">
            {formatDateDisplay(appointment.appointment_date)} · {toTimeInputValue(appointment.start_time)} - {toTimeInputValue(appointment.end_time)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/front-office/appointments/${appointment.appointment_id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AppointmentStatusActions
            status={appointment.status}
            onConfirm={handleConfirm}
            onComplete={() => setIsCompleteOpen(true)}
            onCancel={() => setIsCancelOpen(true)}
            onNoShow={handleNoShow}
            onReschedule={() => setIsRescheduleOpen(true)}
          />
        </div>
      </div>

      <AppointmentDetails appointment={appointment} />

      <CancelAppointmentModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onSubmit={handleCancel}
        isLoading={isSubmitting}
      />
      <CompleteAppointmentModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onSubmit={handleComplete}
        isLoading={isSubmitting}
      />
      <RescheduleAppointmentModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={appointment}
        employees={employees}
        onSubmit={handleReschedule}
        isLoading={isSubmitting}
      />
    </div>
  );
}

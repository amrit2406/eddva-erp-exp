import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { getAppointmentAvailability, getAppointmentConflicts } from '../../api/appointments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { toDateInputValue, toTimeInputValue } from '../../utils/dateTime';
import type {
  FrontOfficeAppointment,
  RescheduleAppointmentFormData,
  AppointmentAvailabilityResult,
  AppointmentConflictResult,
} from '../../types/appointmentRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: FrontOfficeAppointment;
  employees: FrontOfficeEmployee[];
  onSubmit: (data: RescheduleAppointmentFormData) => Promise<void>;
  isLoading?: boolean;
}

function initialForm(appointment: FrontOfficeAppointment): RescheduleAppointmentFormData {
  return {
    appointment_date: toDateInputValue(appointment.appointment_date),
    start_time: toTimeInputValue(appointment.start_time),
    end_time: toTimeInputValue(appointment.end_time),
    host_employee_id: appointment.host_employee_id,
  };
}

export default function RescheduleAppointmentModal({
  isOpen,
  onClose,
  appointment,
  employees,
  onSubmit,
  isLoading,
}: RescheduleAppointmentModalProps) {
  const [form, setForm] = useState<RescheduleAppointmentFormData>(() => initialForm(appointment));
  const [availability, setAvailability] = useState<AppointmentAvailabilityResult | null>(null);
  const [conflictResult, setConflictResult] = useState<AppointmentConflictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(appointment));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!isOpen || !form.host_employee_id || !form.appointment_date) {
      setAvailability(null);
      return;
    }
    getAppointmentAvailability({ host_employee_id: form.host_employee_id, date: form.appointment_date })
      .then(setAvailability)
      .catch(() => setAvailability(null));
  }, [isOpen, form.host_employee_id, form.appointment_date]);

  useEffect(() => {
    if (!isOpen || !form.host_employee_id || !form.appointment_date || !form.start_time || !form.end_time) {
      setConflictResult(null);
      return;
    }
    const timeout = setTimeout(() => {
      getAppointmentConflicts({
        host_employee_id: form.host_employee_id!,
        date: form.appointment_date,
        start_time: form.start_time,
        end_time: form.end_time,
        exclude_id: appointment.appointment_id,
      })
        .then(setConflictResult)
        .catch(() => setConflictResult(null));
    }, 300);
    return () => clearTimeout(timeout);
  }, [isOpen, form.host_employee_id, form.appointment_date, form.start_time, form.end_time, appointment.appointment_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reschedule appointment'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Host Employee</label>
            <Select
              value={form.host_employee_id || ''}
              onChange={(e) => setForm({ ...form, host_employee_id: Number(e.target.value) })}
              options={employees.map((emp) => ({ value: String(emp.employee_id), label: emp.name }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.appointment_date}
              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>
        </div>

        {availability && availability.configured && availability.free_slots.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Available Slots</p>
            <div className="flex flex-wrap gap-2">
              {availability.free_slots.map((slot) => (
                <button
                  key={`${slot.start_time}-${slot.end_time}`}
                  type="button"
                  onClick={() => setForm({ ...form, start_time: slot.start_time, end_time: slot.end_time })}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                >
                  {slot.start_time} – {slot.end_time}
                </button>
              ))}
            </div>
          </div>
        )}

        {availability && availability.booked.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Already Booked</p>
            <div className="flex flex-wrap gap-2">
              {availability.booked.map((slot) => (
                <span
                  key={`${slot.start_time}-${slot.end_time}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 line-through"
                >
                  {slot.start_time} – {slot.end_time}
                </span>
              ))}
            </div>
          </div>
        )}

        {conflictResult?.has_conflict && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              This host already has {conflictResult.conflicts.length} appointment{conflictResult.conflicts.length > 1 ? 's' : ''} overlapping this slot.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Reschedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

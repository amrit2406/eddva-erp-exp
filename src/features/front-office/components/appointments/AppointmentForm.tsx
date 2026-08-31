import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { getVisitors } from '../../api/visitors.api';
import { getAppointmentAvailability, getAppointmentConflicts } from '../../api/appointments.api';
import { cn } from '../../../../utils/cn';
import type { AppointmentFormData, AppointmentAvailabilityResult, AppointmentConflictResult } from '../../types/appointmentRecord.types';
import type { FrontOfficeVisitor } from '../../types/visitorRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

interface AppointmentFormProps {
  formData: AppointmentFormData;
  onChange: (data: AppointmentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  employees: FrontOfficeEmployee[];
  departments: FrontOfficeDepartment[];
  excludeAppointmentId?: number;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function AppointmentForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  employees,
  departments,
  excludeAppointmentId,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: AppointmentFormProps) {
  const [visitorQuery, setVisitorQuery] = useState('');
  const [visitorResults, setVisitorResults] = useState<FrontOfficeVisitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<FrontOfficeVisitor | null>(null);
  const [availability, setAvailability] = useState<AppointmentAvailabilityResult | null>(null);
  const [conflictResult, setConflictResult] = useState<AppointmentConflictResult | null>(null);

  const filteredEmployees = formData.department_id
    ? employees.filter((e) => e.department_id === formData.department_id)
    : employees;

  useEffect(() => {
    if (!visitorQuery.trim()) {
      setVisitorResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      getVisitors({ search: visitorQuery.trim() }).then((r) => setVisitorResults(r.data)).catch(() => setVisitorResults([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [visitorQuery]);

  useEffect(() => {
    if (!formData.host_employee_id || !formData.appointment_date) {
      setAvailability(null);
      return;
    }
    getAppointmentAvailability({
      host_employee_id: formData.host_employee_id,
      date: formData.appointment_date,
    })
      .then(setAvailability)
      .catch(() => setAvailability(null));
  }, [formData.host_employee_id, formData.appointment_date]);

  useEffect(() => {
    if (!formData.host_employee_id || !formData.appointment_date || !formData.start_time || !formData.end_time) {
      setConflictResult(null);
      return;
    }
    const timeout = setTimeout(() => {
      getAppointmentConflicts({
        host_employee_id: formData.host_employee_id,
        date: formData.appointment_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        exclude_id: excludeAppointmentId,
      })
        .then(setConflictResult)
        .catch(() => setConflictResult(null));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formData.host_employee_id, formData.appointment_date, formData.start_time, formData.end_time, excludeAppointmentId]);

  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Visitor</label>
        {selectedVisitor ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">{selectedVisitor.full_name}</p>
              <p className="text-sm text-green-700">{selectedVisitor.phone || selectedVisitor.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedVisitor(null);
                onChange({ ...formData, visitor_id: undefined });
              }}
              className="text-sm text-green-700 hover:text-green-900"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <Input
              value={visitorQuery}
              onChange={(e) => setVisitorQuery(e.target.value)}
              placeholder="Search existing visitor by name, phone, email..."
            />
            {visitorResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {visitorResults.map((v) => (
                  <button
                    key={v.visitor_id}
                    type="button"
                    onClick={() => {
                      setSelectedVisitor(v);
                      setVisitorQuery('');
                      setVisitorResults([]);
                      onChange({ ...formData, visitor_id: v.visitor_id, visitor_name: v.full_name, phone: v.phone || '' });
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                  >
                    <span className="font-medium text-slate-900">{v.full_name}</span>
                    <span className="text-slate-500"> — {v.phone || v.email}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <p className="text-xs text-slate-500">Leave unselected to book for a new (walk-in) visitor by name and phone below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Visitor Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.visitor_name}
            onChange={(e) => onChange({ ...formData, visitor_name: e.target.value })}
            placeholder="Enter visitor name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.department_id || ''}
            onChange={(e) =>
              onChange({ ...formData, department_id: Number(e.target.value), host_employee_id: 0 })
            }
            placeholder="Select department"
            options={departments.map((d) => ({ value: String(d.department_id), label: d.name }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Host Employee <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.host_employee_id || ''}
            onChange={(e) => onChange({ ...formData, host_employee_id: Number(e.target.value) })}
            placeholder="Select host employee"
            options={filteredEmployees.map((e) => ({ value: String(e.employee_id), label: `${e.name}${e.designation ? ` — ${e.designation}` : ''}` }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Appointment Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.appointment_date}
            onChange={(e) => onChange({ ...formData, appointment_date: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={formData.start_time}
              onChange={(e) => onChange({ ...formData, start_time: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={formData.end_time}
              onChange={(e) => onChange({ ...formData, end_time: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
          <Input
            value={formData.purpose}
            onChange={(e) => onChange({ ...formData, purpose: e.target.value })}
            placeholder="Enter appointment purpose"
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
                onClick={() => onChange({ ...formData, start_time: slot.start_time, end_time: slot.end_time })}
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

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}

import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { APPOINTMENT_STATUS_OPTIONS } from '../../constants/appointment.constants';
import { mockVisitors } from '../../mock/visitors.mock';
import { mockEmployees } from '../../mock/employees.mock';
import { cn } from '../../../../utils/cn';

interface AppointmentFormProps {
  defaultValues?: {
    visitorId?: string;
    visitorName?: string;
    visitorPhone?: string;
    hostEmployeeId?: string;
    appointmentDate?: string;
    startTime?: string;
    endTime?: string;
    purpose?: string;
    status?: string;
    notes?: string;
  };
  onSubmit?: (data: any) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function AppointmentForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: AppointmentFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Visitor <span className="text-red-500">*</span>
          </label>
          <Select
            name="visitorId"
            defaultValue={defaultValues?.visitorId}
            placeholder="Select visitor"
            options={mockVisitors.map((v: any) => ({ value: v.id, label: v.fullName }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Host Employee <span className="text-red-500">*</span>
          </label>
          <Select
            name="hostEmployeeId"
            defaultValue={defaultValues?.hostEmployeeId}
            placeholder="Select host employee"
            options={mockEmployees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName} - ${e.designation}` }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Appointment Date <span className="text-red-500">*</span>
          </label>
          <Input
            name="appointmentDate"
            type="date"
            defaultValue={defaultValues?.appointmentDate}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <Input
              name="startTime"
              type="time"
              defaultValue={defaultValues?.startTime}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <Input
              name="endTime"
              type="time"
              defaultValue={defaultValues?.endTime}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Purpose <span className="text-red-500">*</span>
          </label>
          <Input
            name="purpose"
            defaultValue={defaultValues?.purpose}
            placeholder="Enter appointment purpose"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select
            name="status"
            defaultValue={defaultValues?.status}
            placeholder="Select status"
            options={APPOINTMENT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            name="notes"
            defaultValue={defaultValues?.notes}
            placeholder="Enter notes"
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}

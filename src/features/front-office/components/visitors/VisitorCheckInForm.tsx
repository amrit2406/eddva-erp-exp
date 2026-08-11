import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { mockVisitors } from '../../mock/visitors.mock';
import { mockEmployees } from '../../mock/employees.mock';
import { cn } from '../../../../utils/cn';

interface VisitorCheckInFormProps {
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function VisitorCheckInForm({ onSubmit, isSubmitting = false, className }: VisitorCheckInFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Visitor <span className="text-red-500">*</span>
        </label>
        <Select
          name="visitorId"
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
          placeholder="Select host employee"
          options={mockEmployees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName} - ${e.designation}` }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Appointment</label>
        <Select
          name="appointmentId"
          placeholder="Select appointment (optional)"
          options={[{ value: '', label: 'No appointment' }]}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Purpose <span className="text-red-500">*</span>
        </label>
        <Input name="purpose" placeholder="Enter visit purpose" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Badge Number <span className="text-red-500">*</span>
        </label>
        <Input name="badgeNumber" placeholder="Enter badge number" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Time</label>
        <Input
          name="checkInTime"
          type="datetime-local"
          defaultValue={new Date().toISOString().slice(0, 16)}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Checking In...' : 'Check In'}
        </Button>
      </div>
    </form>
  );
}

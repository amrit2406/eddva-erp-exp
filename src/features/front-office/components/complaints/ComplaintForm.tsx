import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { COMPLAINT_CATEGORY_OPTIONS, COMPLAINT_PRIORITY_OPTIONS, COMPLAINT_STATUS_OPTIONS } from '../../constants/complaint.constants';
import { cn } from '../../../../utils/cn';

interface ComplaintFormProps {
  defaultValues?: {
    complainantName?: string;
    phone?: string;
    email?: string;
    category?: string;
    subject?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: string;
  };
  onSubmit?: (data: any) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function ComplaintForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: ComplaintFormProps) {
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
            Complainant Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="complainantName"
            defaultValue={defaultValues?.complainantName}
            placeholder="Enter complainant name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            name="phone"
            defaultValue={defaultValues?.phone}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <Input
            name="email"
            type="email"
            defaultValue={defaultValues?.email}
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <Select
            name="category"
            defaultValue={defaultValues?.category}
            placeholder="Select category"
            options={COMPLAINT_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <Input
            name="subject"
            defaultValue={defaultValues?.subject}
            placeholder="Enter complaint subject"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            defaultValue={defaultValues?.description}
            placeholder="Enter detailed description"
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <Select
            name="priority"
            defaultValue={defaultValues?.priority}
            placeholder="Select priority"
            options={COMPLAINT_PRIORITY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select
            name="status"
            defaultValue={defaultValues?.status}
            placeholder="Select status"
            options={COMPLAINT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
          <Select
            name="assignedTo"
            defaultValue={defaultValues?.assignedTo}
            placeholder="Select assignee"
            options={[{ value: '', label: 'Not assigned' }]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Attachments</label>
          <Input
            name="attachments"
            type="file"
            multiple
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

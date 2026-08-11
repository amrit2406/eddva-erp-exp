import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { ENQUIRY_SOURCE_OPTIONS, ENQUIRY_CATEGORY_OPTIONS, ENQUIRY_STATUS_OPTIONS } from '../../constants/enquiry.constants';
import { cn } from '../../../../utils/cn';

interface EnquiryFormProps {
  defaultValues?: {
    enquirerName?: string;
    phone?: string;
    email?: string;
    source?: string;
    category?: string;
    status?: string;
    assignedTo?: string;
    notes?: string;
  };
  onSubmit?: (data: any) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function EnquiryForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: EnquiryFormProps) {
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
            Enquirer Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="enquirerName"
            defaultValue={defaultValues?.enquirerName}
            placeholder="Enter enquirer name"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
          <Select
            name="source"
            defaultValue={defaultValues?.source}
            placeholder="Select source"
            options={ENQUIRY_SOURCE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <Select
            name="category"
            defaultValue={defaultValues?.category}
            placeholder="Select category"
            options={ENQUIRY_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select
            name="status"
            defaultValue={defaultValues?.status}
            placeholder="Select status"
            options={ENQUIRY_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Next Follow-up Date</label>
          <Input
            name="nextFollowUpDate"
            type="date"
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
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
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

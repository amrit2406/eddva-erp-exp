import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants/complaint.constants';
import { cn } from '../../../../utils/cn';

interface ComplaintUpdateFormProps {
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function ComplaintUpdateForm({ onSubmit, isSubmitting = false, className }: ComplaintUpdateFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <Select
          name="status"
          placeholder="Select status"
          options={COMPLAINT_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Resolution</label>
        <textarea
          name="resolution"
          placeholder="Enter resolution details"
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Complaint'}
        </Button>
      </div>
    </form>
  );
}

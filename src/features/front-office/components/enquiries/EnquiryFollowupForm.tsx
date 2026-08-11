import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { ENQUIRY_FOLLOWUP_RESULT_OPTIONS } from '../../constants/enquiry.constants';
import { cn } from '../../../../utils/cn';

interface EnquiryFollowupFormProps {
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function EnquiryFollowupForm({ onSubmit, isSubmitting = false, className }: EnquiryFollowupFormProps) {
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
          Follow-up Date <span className="text-red-500">*</span>
        </label>
        <Input
          name="followUpDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Time</label>
        <Input
          name="followUpTime"
          type="time"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
        <Select
          name="method"
          placeholder="Select method"
          options={[
            { value: 'phone', label: 'Phone' },
            { value: 'email', label: 'Email' },
            { value: 'in_person', label: 'In Person' },
            { value: 'video_call', label: 'Video Call' },
          ]}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Result</label>
        <Select
          name="result"
          placeholder="Select result"
          options={ENQUIRY_FOLLOWUP_RESULT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Next Follow-up Date</label>
        <Input
          name="nextFollowUpDate"
          type="date"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          name="notes"
          placeholder="Enter follow-up notes"
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Follow-up'}
        </Button>
      </div>
    </form>
  );
}

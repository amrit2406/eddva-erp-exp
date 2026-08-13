import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { PaymentTermFormData } from '../../types/sales-purchase.types';

interface PaymentTermFormProps {
  defaultValues?: PaymentTermFormData;
  onSubmit?: (data: PaymentTermFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function PaymentTermForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: PaymentTermFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: PaymentTermFormData = {
      termName: formData.get('termName') as string,
      days: parseInt(formData.get('days') as string),
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Term Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="termName"
            defaultValue={defaultValues?.termName}
            placeholder="Enter term name (e.g., Net 30)"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Days <span className="text-red-500">*</span>
          </label>
          <Input
            name="days"
            type="number"
            defaultValue={defaultValues?.days}
            placeholder="Enter number of days"
            required
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}

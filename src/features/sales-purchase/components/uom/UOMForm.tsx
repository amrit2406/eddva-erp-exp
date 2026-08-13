import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { UOMFormData } from '../../types/sales-purchase.types';

interface UOMFormProps {
  defaultValues?: UOMFormData;
  onSubmit?: (data: UOMFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function UOMForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: UOMFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: UOMFormData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            UOM Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            defaultValue={defaultValues?.name}
            placeholder="Enter UOM name (e.g., Pieces)"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Code <span className="text-red-500">*</span>
          </label>
          <Input
            name="code"
            defaultValue={defaultValues?.code}
            placeholder="Enter code (e.g., PCS)"
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

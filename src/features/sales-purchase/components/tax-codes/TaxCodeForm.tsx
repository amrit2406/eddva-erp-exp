import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { TaxCodeFormData } from '../../types/sales-purchase.types';

interface TaxCodeFormProps {
  defaultValues?: TaxCodeFormData;
  onSubmit?: (data: TaxCodeFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function TaxCodeForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: TaxCodeFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: TaxCodeFormData = {
      name: formData.get('name') as string,
      cgstPct: parseFloat(formData.get('cgstPct') as string),
      sgstPct: parseFloat(formData.get('sgstPct') as string),
      igstPct: parseFloat(formData.get('igstPct') as string),
      effectiveFrom: formData.get('effectiveFrom') as string,
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tax Name <span className="text-red-500">*</span>
        </label>
        <Input
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Enter tax name (e.g., GST 18%)"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CGST % <span className="text-red-500">*</span>
          </label>
          <Input
            name="cgstPct"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.cgstPct}
            placeholder="e.g., 9"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            SGST % <span className="text-red-500">*</span>
          </label>
          <Input
            name="sgstPct"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.sgstPct}
            placeholder="e.g., 9"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            IGST % <span className="text-red-500">*</span>
          </label>
          <Input
            name="igstPct"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.igstPct}
            placeholder="e.g., 18"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Effective From <span className="text-red-500">*</span>
        </label>
        <Input
          name="effectiveFrom"
          type="datetime-local"
          defaultValue={defaultValues?.effectiveFrom}
          required
        />
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

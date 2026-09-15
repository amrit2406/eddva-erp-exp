import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { TaxCodeFormData } from '../../types/sales-purchase.types';

interface TaxCodeFormProps {
  onSubmit?: (data: TaxCodeFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function TaxCodeForm({
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
      cgst_pct: parseFloat(formData.get('cgst_pct') as string),
      sgst_pct: parseFloat(formData.get('sgst_pct') as string),
      igst_pct: parseFloat(formData.get('igst_pct') as string),
      effective_from: formData.get('effective_from') as string,
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tax Name <span className="text-red-500">*</span>
        </label>
        <Input name="name" placeholder="Enter tax name (e.g., GST 18%)" required />
      </div>
      <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        Tax rates and the effective-from date can't be edited once created, since that would change the rate
        used by historical invoices. To change a rate, create a new tax code instead.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CGST % <span className="text-red-500">*</span>
          </label>
          <Input name="cgst_pct" type="number" step="0.01" placeholder="e.g., 9" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            SGST % <span className="text-red-500">*</span>
          </label>
          <Input name="sgst_pct" type="number" step="0.01" placeholder="e.g., 9" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            IGST % <span className="text-red-500">*</span>
          </label>
          <Input name="igst_pct" type="number" step="0.01" placeholder="e.g., 18" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Effective From <span className="text-red-500">*</span>
        </label>
        <Input name="effective_from" type="date" required />
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

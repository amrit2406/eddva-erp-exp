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
  isEdit?: boolean;
}

export default function TaxCodeForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
  isEdit = false,
}: TaxCodeFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: TaxCodeFormData = isEdit
      ? {
          name: formData.get('name') as string,
        }
      : {
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
      {isEdit && (
        <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          Tax rates and the effective-from date can't be edited once created, since that would change the rate used by historical invoices. To change a rate, create a new tax code instead.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CGST % {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <Input
            name="cgstPct"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.cgstPct}
            placeholder="e.g., 9"
            required={!isEdit}
            disabled={isEdit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            SGST % {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <Input
            name="sgstPct"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.sgstPct}
            placeholder="e.g., 9"
            required={!isEdit}
            disabled={isEdit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            IGST % {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <Input
            name="igstPct"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.igstPct}
            placeholder="e.g., 18"
            required={!isEdit}
            disabled={isEdit}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Effective From {!isEdit && <span className="text-red-500">*</span>}
        </label>
        <Input
          name="effectiveFrom"
          type="datetime-local"
          defaultValue={defaultValues?.effectiveFrom}
          required={!isEdit}
          disabled={isEdit}
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

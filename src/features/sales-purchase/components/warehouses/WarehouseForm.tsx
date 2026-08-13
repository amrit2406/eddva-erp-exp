import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { WarehouseFormData } from '../../types/sales-purchase.types';

interface WarehouseFormProps {
  defaultValues?: WarehouseFormData;
  onSubmit?: (data: WarehouseFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function WarehouseForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: WarehouseFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: WarehouseFormData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      isDefault: formData.get('isDefault') === 'true',
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Warehouse Name <span className="text-red-500">*</span>
        </label>
        <Input
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Enter warehouse name (e.g., Central Warehouse)"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <Input
          name="address"
          defaultValue={defaultValues?.address}
          placeholder="Enter warehouse address"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isDefault"
          id="isDefault"
          defaultChecked={defaultValues?.isDefault}
          className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
        />
        <label htmlFor="isDefault" className="text-sm text-slate-700">
          Set as default warehouse
        </label>
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

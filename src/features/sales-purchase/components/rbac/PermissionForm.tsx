import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { PermissionFormData } from '../../types/sales-purchase.types';

interface PermissionFormProps {
  defaultValues?: PermissionFormData;
  onSubmit?: (data: PermissionFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function PermissionForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: PermissionFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: PermissionFormData = {
      permissionKey: formData.get('permissionKey') as string,
      description: formData.get('description') as string,
    };

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Permission Key <span className="text-red-500">*</span>
          </label>
          <Input
            name="permissionKey"
            defaultValue={defaultValues?.permissionKey}
            placeholder="e.g., sales.discount.approve"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Use dot notation (e.g., module.action.entity)
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            defaultValue={defaultValues?.description}
            placeholder="Enter permission description"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
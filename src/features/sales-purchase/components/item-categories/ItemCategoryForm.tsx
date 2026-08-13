import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { ItemCategoryFormData } from '../../types/sales-purchase.types';

interface ItemCategoryFormProps {
  defaultValues?: ItemCategoryFormData;
  onSubmit?: (data: ItemCategoryFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function ItemCategoryForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: ItemCategoryFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: ItemCategoryFormData = {
      categoryName: formData.get('categoryName') as string,
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Category Name <span className="text-red-500">*</span>
        </label>
        <Input
          name="categoryName"
          defaultValue={defaultValues?.categoryName}
          placeholder="Enter category name (e.g., Raw Materials)"
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

import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { ItemFormData, ItemCategory, UOM, TaxCode } from '../../types/sales-purchase.types';

interface ItemFormProps {
  defaultValues?: ItemFormData;
  categories?: ItemCategory[];
  uoms?: UOM[];
  taxCodes?: TaxCode[];
  onSubmit?: (data: ItemFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function ItemForm({
  defaultValues,
  categories = [],
  uoms = [],
  taxCodes = [],
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: ItemFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: ItemFormData = {
      itemCode: formData.get('itemCode') as string,
      itemName: formData.get('itemName') as string,
      categoryId: formData.get('categoryId') as string,
      uomId: formData.get('uomId') as string,
      quantity: parseFloat(formData.get('quantity') as string),
      hsnSacCode: formData.get('hsnSacCode') as string,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      salesPrice: parseFloat(formData.get('salesPrice') as string),
      taxCodeId: formData.get('taxCodeId') as string,
    };
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Item Code <span className="text-red-500">*</span>
          </label>
          <Input
            name="itemCode"
            defaultValue={defaultValues?.itemCode}
            placeholder="e.g., ITEM-001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="itemName"
            defaultValue={defaultValues?.itemName}
            placeholder="e.g., Steel Rod 10mm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            name="categoryId"
            defaultValue={defaultValues?.categoryId}
            placeholder="Select category"
            options={categories.map((cat) => ({ value: cat.id, label: cat.categoryName }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Unit of Measure <span className="text-red-500">*</span>
          </label>
          <Select
            name="uomId"
            defaultValue={defaultValues?.uomId}
            placeholder="Select UOM"
            options={uoms.map((uom) => ({ value: uom.id, label: `${uom.name} (${uom.code})` }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <Input
            name="quantity"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.quantity}
            placeholder="Enter quantity"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            HSN/SAC Code <span className="text-red-500">*</span>
          </label>
          <Input
            name="hsnSacCode"
            defaultValue={defaultValues?.hsnSacCode}
            placeholder="e.g., 72142090"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Purchase Price <span className="text-red-500">*</span>
          </label>
          <Input
            name="purchasePrice"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.purchasePrice}
            placeholder="Enter purchase price"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sales Price <span className="text-red-500">*</span>
          </label>
          <Input
            name="salesPrice"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.salesPrice}
            placeholder="Enter sales price"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tax Code <span className="text-red-500">*</span>
          </label>
          <Select
            name="taxCodeId"
            defaultValue={defaultValues?.taxCodeId}
            placeholder="Select tax code"
            options={taxCodes.map((tax) => ({ value: tax.id, label: tax.name }))}
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

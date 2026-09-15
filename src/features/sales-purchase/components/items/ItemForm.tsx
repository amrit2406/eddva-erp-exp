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
      item_name: formData.get('item_name') as string,
      category_id: Number(formData.get('category_id')),
      uom_id: Number(formData.get('uom_id')),
      purchase_price: parseFloat(formData.get('purchase_price') as string),
      sales_price: parseFloat(formData.get('sales_price') as string),
      tax_code_id: Number(formData.get('tax_code_id')),
    };
    const hsnSacCode = formData.get('hsn_sac_code') as string;
    if (hsnSacCode) data.hsn_sac_code = hsnSacCode;
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="item_name"
            defaultValue={defaultValues?.item_name}
            placeholder="e.g., A4 Copier Paper (Ream)"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            name="category_id"
            defaultValue={defaultValues?.category_id ? String(defaultValues.category_id) : undefined}
            placeholder="Select category"
            options={categories.map((cat) => ({ value: String(cat.category_id), label: cat.name }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Unit of Measure <span className="text-red-500">*</span>
          </label>
          <Select
            name="uom_id"
            defaultValue={defaultValues?.uom_id ? String(defaultValues.uom_id) : undefined}
            placeholder="Select UOM"
            options={uoms.map((uom) => ({ value: String(uom.uom_id), label: `${uom.name} (${uom.symbol})` }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            HSN/SAC Code
          </label>
          <Input
            name="hsn_sac_code"
            defaultValue={defaultValues?.hsn_sac_code}
            placeholder="e.g., 4802"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Purchase Price <span className="text-red-500">*</span>
          </label>
          <Input
            name="purchase_price"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.purchase_price}
            placeholder="Enter purchase price"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sales Price <span className="text-red-500">*</span>
          </label>
          <Input
            name="sales_price"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.sales_price}
            placeholder="Enter sales price"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tax Code <span className="text-red-500">*</span>
          </label>
          <Select
            name="tax_code_id"
            defaultValue={defaultValues?.tax_code_id ? String(defaultValues.tax_code_id) : undefined}
            placeholder="Select tax code"
            options={taxCodes.map((tax) => ({ value: String(tax.tax_code_id), label: tax.name }))}
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

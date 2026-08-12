import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import { CUSTOMER_STATUS_OPTIONS } from '../../constants/customer.constants';
import { cn } from '../../../../utils/cn';

interface CustomerFormProps {
  defaultValues?: {
    customerName?: string;
    gstin?: string;
    taxId?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    paymentTermId?: string;
    creditLimit?: number;
    status?: string;
  };
  onSubmit?: (data: any) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function CustomerForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: CustomerFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="customerName"
            defaultValue={defaultValues?.customerName}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
          <Input
            name="gstin"
            defaultValue={defaultValues?.gstin}
            placeholder="Enter GSTIN"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID</label>
          <Input
            name="taxId"
            defaultValue={defaultValues?.taxId}
            placeholder="Enter tax ID"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
          <Input
            name="addressLine1"
            defaultValue={defaultValues?.addressLine1}
            placeholder="Enter address line 1"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label>
          <Input
            name="addressLine2"
            defaultValue={defaultValues?.addressLine2}
            placeholder="Enter address line 2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
          <Input
            name="city"
            defaultValue={defaultValues?.city}
            placeholder="Enter city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
          <Input
            name="state"
            defaultValue={defaultValues?.state}
            placeholder="Enter state"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
          <Input
            name="pincode"
            defaultValue={defaultValues?.pincode}
            placeholder="Enter pincode"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
          <Select
            name="paymentTermId"
            defaultValue={defaultValues?.paymentTermId}
            placeholder="Select payment terms"
            options={[
              { value: 'PT001', label: 'Net 30' },
              { value: 'PT002', label: 'Net 45' },
              { value: 'PT003', label: 'COD' },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit</label>
          <Input
            name="creditLimit"
            type="number"
            defaultValue={defaultValues?.creditLimit}
            placeholder="Enter credit limit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <Select
            name="status"
            defaultValue={defaultValues?.status || 'active'}
            placeholder="Select status"
            options={CUSTOMER_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
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

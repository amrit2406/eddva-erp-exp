import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { CustomerFormData } from '../../types/sales-purchase.types';

interface CustomerFormProps {
  defaultValues?: CustomerFormData;
  onSubmit?: (data: CustomerFormData) => void;
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
    
    const data: CustomerFormData = {
      customerName: formData.get('customerName') as string,
      status: formData.get('status') as string,
      contacts: defaultValues?.contacts || [],
    };

    // Only include optional fields if they have values
    const gstin = formData.get('gstin') as string;
    if (gstin) data.gstin = gstin;

    const addressLine1 = formData.get('addressLine1') as string;
    if (addressLine1) data.addressLine1 = addressLine1;

    const addressLine2 = formData.get('addressLine2') as string;
    if (addressLine2) data.addressLine2 = addressLine2;

    const city = formData.get('city') as string;
    if (city) data.city = city;

    const state = formData.get('state') as string;
    if (state) data.state = state;

    const pincode = formData.get('pincode') as string;
    if (pincode) data.pincode = pincode;

    const paymentTermId = formData.get('paymentTermId') as string;
    if (paymentTermId) data.paymentTermId = paymentTermId;

    const creditLimit = formData.get('creditLimit') as string;
    if (creditLimit) data.creditLimit = Number(creditLimit);

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
            placeholder="Enter GSTIN (e.g., 27BBBBB0000B1Z6)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status || 'ACTIVE'}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
            <Input
              name="addressLine1"
              defaultValue={defaultValues?.addressLine1}
              placeholder="Building, Street, Area"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label>
            <Input
              name="addressLine2"
              defaultValue={defaultValues?.addressLine2}
              placeholder="Landmark, Phase"
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
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Term</label>
            <select
              name="paymentTermId"
              defaultValue={defaultValues?.paymentTermId}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment term</option>
              {/* Payment terms will be loaded dynamically */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit (₹)</label>
            <Input
              name="creditLimit"
              type="number"
              defaultValue={defaultValues?.creditLimit}
              placeholder="Enter credit limit"
            />
          </div>
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

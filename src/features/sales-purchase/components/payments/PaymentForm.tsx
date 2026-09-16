import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { PaymentFormData } from '../../types/sales-purchase.types';
import { getInvoices } from '../../api/sales-purchase.api';
import type { Invoice } from '../../types/sales-purchase.types';

interface PaymentFormProps {
  defaultValues?: PaymentFormData;
  onSubmit?: (data: PaymentFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function PaymentForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: PaymentFormProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: PaymentFormData = {
      pi_id: Number(formData.get('pi_id')),
      payment_date: formData.get('payment_date') as string,
      amount: formData.get('amount') ? Number(formData.get('amount')) : 0,
      mode: formData.get('mode') as string,
      reference_no: (formData.get('reference_no') as string) || undefined,
    };

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading dropdown options...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Purchase Invoice <span className="text-red-500">*</span>
              </label>
              <select
                name="pi_id"
                defaultValue={defaultValues?.pi_id ? String(defaultValues.pi_id) : ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.pi_id} value={invoice.pi_id}>
                    {invoice.invoice_number}
                  </option>
                ))}
              </select>
            </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Payment Date <span className="text-red-500">*</span>
          </label>
          <Input
            name="payment_date"
            type="date"
            defaultValue={defaultValues?.payment_date?.split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <Input
            name="amount"
            type="number"
            defaultValue={defaultValues?.amount || 0}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Payment Mode <span className="text-red-500">*</span>
          </label>
          <select
            name="mode"
            defaultValue={defaultValues?.mode}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select mode</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
          <Input
            name="reference_no"
            defaultValue={defaultValues?.reference_no}
            placeholder="Transaction reference"
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
        </>
      )}
    </form>
  );
}

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
      console.log('All invoices:', data);
      data.forEach((inv, i) => {
        console.log(`Invoice ${i} invoiceType:`, inv.invoiceType);
      });
      const purchaseInvoices = data.filter(inv => inv.invoiceType === 'PURCHASE');
      console.log('Purchase invoices:', purchaseInvoices);
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
    
    const paymentDate = formData.get('paymentDate') as string;
    
    const data: PaymentFormData = {
      purchaseInvoiceId: formData.get('purchaseInvoiceId') as string,
      paymentDate: paymentDate ? new Date(paymentDate).toISOString() : '',
      amount: formData.get('paymentAmount') ? Number(formData.get('paymentAmount')) : 0,
      mode: formData.get('mode') as string,
      referenceNo: formData.get('referenceNo') as string || undefined,
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
                name="purchaseInvoiceId"
                defaultValue={defaultValues?.purchaseInvoiceId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select invoice</option>
                {invoices.filter(inv => inv.invoiceType === 'PURCHASE' || inv.invoiceType === undefined || inv.invoiceType === null).map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    INV-{invoice.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Payment Date <span className="text-red-500">*</span>
          </label>
          <Input
            name="paymentDate"
            type="date"
            defaultValue={defaultValues?.paymentDate?.split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <Input
            name="paymentAmount"
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
            name="referenceNo"
            defaultValue={defaultValues?.referenceNo}
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

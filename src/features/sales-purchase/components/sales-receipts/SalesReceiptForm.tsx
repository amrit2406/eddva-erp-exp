import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import { useState, useEffect } from 'react';
import { getSalesInvoices } from '../../api/sales-purchase.api';
import type { SalesReceiptFormData, SalesInvoice } from '../../types/sales-purchase.types';

interface SalesReceiptFormProps {
  defaultValues?: SalesReceiptFormData;
  onSubmit?: (data: SalesReceiptFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function SalesReceiptForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: SalesReceiptFormProps) {
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getSalesInvoices();
      setSalesInvoices(data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: SalesReceiptFormData = {
      salesInvoiceId: formData.get('salesInvoiceId') as string,
      receiptDate: formData.get('receiptDate') as string,
      amount: Number(formData.get('amount')),
      mode: formData.get('mode') as string,
      referenceNo: formData.get('referenceNo') as string || undefined,
    };

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {loading ? (
        <div className="text-center text-slate-500 py-8">Loading data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sales Invoice <span className="text-red-500">*</span>
              </label>
              <select
                name="salesInvoiceId"
                defaultValue={defaultValues?.salesInvoiceId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select sales invoice</option>
                {salesInvoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Receipt Date <span className="text-red-500">*</span>
              </label>
              <Input
                name="receiptDate"
                type="date"
                defaultValue={defaultValues?.receiptDate ? new Date(defaultValues.receiptDate).toISOString().split('T')[0] : ''}
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
                step="0.01"
                defaultValue={defaultValues?.amount || 0}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="mode"
                defaultValue={defaultValues?.mode || 'CASH'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Card</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference No</label>
              <Input
                name="referenceNo"
                defaultValue={defaultValues?.referenceNo || ''}
                placeholder="Enter reference number"
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

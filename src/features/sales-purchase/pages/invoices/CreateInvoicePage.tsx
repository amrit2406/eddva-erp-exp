import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { createInvoice } from '../../api/sales-purchase.api';
import type { InvoiceFormData } from '../../types/sales-purchase.types';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting invoice data:', data);
      await createInvoice(data);
      navigate('/sales-purchase/invoices');
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(errorMessage || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/invoices">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Invoice</h1>
          <p className="text-slate-600 mt-1">Create a new invoice</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <InvoiceForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Invoice"
          />
        </div>
      </Card>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesInvoiceForm from '../../components/sales-invoices/SalesInvoiceForm';
import { createSalesInvoice } from '../../api/sales-purchase.api';
import type { SalesInvoiceFormData } from '../../types/sales-purchase.types';

export default function CreateSalesInvoicePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SalesInvoiceFormData) => {
    try {
      setIsSubmitting(true);
      await createSalesInvoice(data);
      navigate('/sales-purchase/sales-invoices');
    } catch (error: any) {
      console.error('Failed to create sales invoice:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create sales invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/sales-invoices">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Sales Invoice</h1>
          <p className="text-slate-600 mt-1">Create a new sales invoice</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <SalesInvoiceForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Sales Invoice"
          />
        </div>
      </Card>
    </div>
  );
}

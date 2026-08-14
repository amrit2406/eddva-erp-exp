import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { getInvoice, updateInvoice } from '../../api/sales-purchase.api';
import type { InvoiceFormData } from '../../types/sales-purchase.types';

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<InvoiceFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(invoiceId: string) {
    try {
      setLoading(true);
      const data = await getInvoice(invoiceId);
      setDefaultValues({
        invoiceType: data.invoiceType,
        customerId: data.customerId,
        vendorId: data.vendorId,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        warehouseId: data.warehouseId,
        discount: data.discount,
        items: data.items,
      });
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: InvoiceFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateInvoice(id, data);
      navigate('/sales-purchase/invoices');
    } catch (error: any) {
      console.error('Failed to update invoice:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update invoice');
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Invoice</h1>
          <p className="text-slate-600 mt-1">Update invoice information</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="p-6">
            {defaultValues && (
              <InvoiceForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Invoice"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

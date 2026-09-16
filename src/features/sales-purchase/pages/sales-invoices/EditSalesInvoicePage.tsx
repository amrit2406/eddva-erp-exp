import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesInvoiceForm from '../../components/sales-invoices/SalesInvoiceForm';
import { getSalesInvoice, updateSalesInvoice } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { SalesInvoiceFormData } from '../../types/sales-purchase.types';

export default function EditSalesInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<SalesInvoiceFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(salesInvoiceId: string) {
    try {
      setLoading(true);
      const data = await getSalesInvoice(salesInvoiceId);
      setDefaultValues({
        customer_id: data.customer_id,
        sales_order_id: data.sales_order_id || undefined,
        invoice_date: data.invoice_date,
        due_date: data.due_date || undefined,
        discount: Number(data.discount) || 0,
        items: (data.items || []).map((item) => ({
          item_id: item.item_id,
          so_item_id: item.so_item_id || undefined,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          // The API doesn't return the original tax_code_id on read (only the resulting
          // cgst/sgst/igst rates), so the tax code must be re-selected when editing a line.
          tax_code_id: 0,
          line_discount: Number(item.line_discount) || 0,
        })),
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

  const handleSubmit = async (data: SalesInvoiceFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await updateSalesInvoice(id, data);
      navigate('/sales-purchase/sales-invoices');
    } catch (error: any) {
      console.error('Failed to update sales invoice:', error);
      if (error.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(error, 'Failed to update sales invoice'));
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Sales Invoice</h1>
          <p className="text-slate-600 mt-1">Update sales invoice information</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                {error}
              </div>
            )}
            {defaultValues && (
              <SalesInvoiceForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Sales Invoice"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

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
        vendor_invoice_number: data.vendor_invoice_number,
        vendor_id: data.vendor_id,
        purchase_order_id: data.purchase_order_id || undefined,
        grn_id: data.grn_id || undefined,
        invoice_date: data.invoice_date,
        due_date: data.due_date || undefined,
        discount: Number(data.discount) || 0,
        items: (data.items || []).map((item) => ({
          item_id: item.item_id,
          po_item_id: item.po_item_id || undefined,
          grn_item_id: item.grn_item_id || undefined,
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
      alert(error.response?.data?.error?.message || error.message || 'Failed to update invoice');
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

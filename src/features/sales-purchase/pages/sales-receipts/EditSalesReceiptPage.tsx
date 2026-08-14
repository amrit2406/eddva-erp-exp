import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SalesReceiptForm from '../../components/sales-receipts/SalesReceiptForm';
import { getSalesReceipt, updateSalesReceipt } from '../../api/sales-purchase.api';
import type { SalesReceiptFormData } from '../../types/sales-purchase.types';

export default function EditSalesReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<SalesReceiptFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(salesReceiptId: string) {
    try {
      setLoading(true);
      const data = await getSalesReceipt(salesReceiptId);
      setDefaultValues({
        salesInvoiceId: data.salesInvoiceId,
        receiptDate: data.receiptDate,
        amount: data.amount,
        mode: data.mode,
        referenceNo: data.referenceNo,
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

  const handleSubmit = async (data: SalesReceiptFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateSalesReceipt(id, data);
      navigate('/sales-purchase/sales-receipts');
    } catch (error: any) {
      console.error('Failed to update sales receipt:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update sales receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/sales-receipts">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Sales Receipt</h1>
          <p className="text-slate-600 mt-1">Update sales receipt information</p>
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
              <SalesReceiptForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Sales Receipt"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

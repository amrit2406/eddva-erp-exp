import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PaymentForm from '../../components/payments/PaymentForm';
import { getPayment, updatePayment } from '../../api/sales-purchase.api';
import type { PaymentFormData } from '../../types/sales-purchase.types';

export default function EditPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<PaymentFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(paymentId: string) {
    try {
      setLoading(true);
      const data = await getPayment(paymentId);
      setDefaultValues({
        paymentType: data.paymentType,
        invoiceId: data.invoiceId,
        paymentDate: data.paymentDate,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
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

  const handleSubmit = async (data: PaymentFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updatePayment(id, data);
      navigate('/sales-purchase/payments');
    } catch (error: any) {
      console.error('Failed to update payment:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/payments">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Payment</h1>
          <p className="text-slate-600 mt-1">Update payment information</p>
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
              <PaymentForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Payment"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

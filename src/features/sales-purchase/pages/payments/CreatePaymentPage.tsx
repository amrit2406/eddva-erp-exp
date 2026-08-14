import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PaymentForm from '../../components/payments/PaymentForm';
import { createPayment } from '../../api/sales-purchase.api';
import type { PaymentFormData } from '../../types/sales-purchase.types';

export default function CreatePaymentPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log('Submitting payment data:', data);
      await createPayment(data);
      navigate('/sales-purchase/payments');
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        return;
      }
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || error.message;
      setError(errorMessage || 'Failed to create payment');
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
          <h1 className="text-2xl font-bold text-slate-900">Add Payment</h1>
          <p className="text-slate-600 mt-1">Create a new payment</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <PaymentForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Payment"
          />
        </div>
      </Card>
    </div>
  );
}

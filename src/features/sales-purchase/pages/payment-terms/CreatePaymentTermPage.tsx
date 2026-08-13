import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PaymentTermForm from '../../components/payment-terms/PaymentTermForm';
import { createPaymentTerm } from '../../api/sales-purchase.api';
import type { PaymentTermFormData } from '../../types/sales-purchase.types';

export default function CreatePaymentTermPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PaymentTermFormData) => {
    try {
      setIsSubmitting(true);
      await createPaymentTerm(data);
      navigate('/sales-purchase/payment-terms');
    } catch (error: any) {
      console.error('Failed to create payment term:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create payment term');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/payment-terms">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Payment Term</h1>
          <p className="text-slate-600 mt-1">Create a new payment term</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <PaymentTermForm onSubmit={handleSubmit} submitText="Create Payment Term" isSubmitting={isSubmitting} />
        </div>
      </Card>
    </div>
  );
}

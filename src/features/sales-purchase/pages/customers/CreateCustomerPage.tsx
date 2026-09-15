import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CustomerForm from '../../components/customers/CustomerForm';
import { createCustomer, getPaymentTerms } from '../../api/sales-purchase.api';
import type { CustomerFormData, PaymentTerm } from '../../types/sales-purchase.types';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);

  useEffect(() => {
    getPaymentTerms()
      .then(setPaymentTerms)
      .catch((err) => {
        if (err.response?.status !== 401) {
          console.error('Failed to load payment terms:', err);
        }
      });
  }, []);

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      await createCustomer(data);
      navigate('/sales-purchase/customers');
    } catch (error: any) {
      console.error('Failed to create customer:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/customers">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Customer</h1>
          <p className="text-slate-600 mt-1">Create a new customer</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <CustomerForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitText="Create Customer"
            paymentTerms={paymentTerms}
          />
        </div>
      </Card>
    </div>
  );
}

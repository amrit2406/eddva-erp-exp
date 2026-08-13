import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PaymentTermForm from '../../components/payment-terms/PaymentTermForm';
import { getPaymentTerm, updatePaymentTerm } from '../../api/sales-purchase.api';
import type { PaymentTermFormData } from '../../types/sales-purchase.types';

export default function EditPaymentTermPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<PaymentTermFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(termId: string) {
    try {
      setLoading(true);
      const data = await getPaymentTerm(termId);
      setDefaultValues({
        termName: data.termName,
        days: data.days,
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

  const handleSubmit = async (data: PaymentTermFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updatePaymentTerm(id, data);
      navigate('/sales-purchase/payment-terms');
    } catch (error: any) {
      console.error('Failed to update payment term:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update payment term');
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Payment Term</h1>
          <p className="text-slate-600 mt-1">Update payment term information</p>
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
              <PaymentTermForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Payment Term"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

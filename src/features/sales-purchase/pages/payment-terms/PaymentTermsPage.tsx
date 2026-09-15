import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PaymentTermTable from '../../components/payment-terms/PaymentTermTable';
import { getPaymentTerms, deletePaymentTerm } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { PaymentTerm } from '../../types/sales-purchase.types';

export default function PaymentTermsPage() {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentTerms();
  }, []);

  async function loadPaymentTerms() {
    try {
      setLoading(true);
      const data = await getPaymentTerms();
      setPaymentTerms(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load payment terms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment term?')) {
      return;
    }
    try {
      await deletePaymentTerm(id);
      setPaymentTerms(paymentTerms.filter((t) => t.payment_term_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete payment term'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Terms</h1>
          <p className="text-slate-600 mt-1">Manage payment terms for invoices</p>
        </div>
        <Link to="/sales-purchase/payment-terms/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Term
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <PaymentTermTable paymentTerms={paymentTerms} onDelete={handleDelete} />
          )}
        </div>
      </Card>
    </div>
  );
}

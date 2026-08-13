import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPaymentTerm } from '../../api/sales-purchase.api';
import type { PaymentTerm } from '../../types/sales-purchase.types';

export default function PaymentTermDetailsPage() {
  const { id } = useParams();
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPaymentTerm(id);
    }
  }, [id]);

  async function loadPaymentTerm(termId: string) {
    try {
      setLoading(true);
      const data = await getPaymentTerm(termId);
      setPaymentTerm(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load payment term');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/payment-terms">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Payment Term Details</h1>
          <p className="text-slate-600 mt-1">View payment term information</p>
        </div>
        <Link to={`/sales-purchase/payment-terms/${id}/edit`}>
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : paymentTerm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Term Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Term Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{paymentTerm.termName}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Days</label>
                  <p className="mt-1 text-slate-900">{paymentTerm.days} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Payment Term ID</label>
                  <p className="mt-1 text-slate-900">{paymentTerm.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{paymentTerm.createdAt ? new Date(paymentTerm.createdAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

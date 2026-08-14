import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, CreditCard, Calendar, IndianRupee, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPayment } from '../../api/sales-purchase.api';
import type { Payment } from '../../types/sales-purchase.types';

export default function PaymentDetailsPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPayment(id);
    }
  }, [id]);

  async function loadPayment(paymentId: string) {
    try {
      setLoading(true);
      const data = await getPayment(paymentId);
      setPayment(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/payments">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Payment Details</h1>
          <p className="text-slate-600 mt-1">View payment information</p>
        </div>
        <Link to={`/sales-purchase/payments/${id}/edit`}>
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
      ) : payment ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">PAY-{payment.id.slice(0, 8)}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  {payment.paymentType === 'RECEIVED' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">Type</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{payment.paymentType}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-sm font-medium">Amount</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{payment.amount.toFixed(2)}</div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Invoice</label>
                  <div className="mt-1 flex items-center gap-2 text-slate-900">
                    <FileText className="h-4 w-4 text-slate-400" />
                    INV-{payment.invoiceId?.slice(0, 8) || '-'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Payment Method</label>
                  <div className="mt-1 text-slate-900">{payment.paymentMethod}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Reference</label>
                  <div className="mt-1 text-slate-900">{payment.reference || '-'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {payment.status}
                    </span>
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

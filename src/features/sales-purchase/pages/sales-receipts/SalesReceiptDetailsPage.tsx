import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Calendar, IndianRupee, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getSalesReceipt, voidSalesReceipt } from '../../api/sales-purchase.api';
import type { SalesReceipt } from '../../types/sales-purchase.types';

export default function SalesReceiptDetailsPage() {
  const { id } = useParams();
  const [salesReceipt, setSalesReceipt] = useState<SalesReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSalesReceipt(id);
    }
  }, [id]);

  async function loadSalesReceipt(salesReceiptId: string) {
    try {
      setLoading(true);
      const data = await getSalesReceipt(salesReceiptId);
      setSalesReceipt(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load sales receipt');
    } finally {
      setLoading(false);
    }
  }

  const handleVoid = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to void this sales receipt?')) {
      return;
    }
    try {
      await voidSalesReceipt(id);
      loadSalesReceipt(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to void sales receipt');
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Sales Receipt Details</h1>
          <p className="text-slate-600 mt-1">View sales receipt information</p>
        </div>
        <div className="flex gap-2">
          {salesReceipt?.status !== 'VOID' && (
            <Button variant="danger" size="sm" onClick={handleVoid}>
              <XCircle className="h-4 w-4 mr-2" />
              Void
            </Button>
          )}
          <Link to={`/sales-purchase/sales-receipts/${id}/edit`}>
            <Button variant="primary" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : salesReceipt ? (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Receipt Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Invoice</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{salesReceipt.salesInvoice?.id || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1 text-slate-900">{salesReceipt.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Receipt Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{new Date(salesReceipt.receiptDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Amount</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-slate-900">{Number(salesReceipt.amount).toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Mode</label>
                  <p className="mt-1 text-slate-900">{salesReceipt.mode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Reference No</label>
                  <p className="mt-1 text-slate-900">{salesReceipt.referenceNo || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Receipt ID</label>
                  <p className="mt-1 text-slate-900">{salesReceipt.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesReceipt.createdAt ? new Date(salesReceipt.createdAt).toLocaleString() : '-'}</p>
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

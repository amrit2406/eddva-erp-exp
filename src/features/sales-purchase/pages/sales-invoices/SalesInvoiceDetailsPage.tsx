import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Calendar, IndianRupee, Download, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getSalesInvoice, getSalesInvoicePDF, postSalesInvoice, cancelSalesInvoice } from '../../api/sales-purchase.api';
import type { SalesInvoice } from '../../types/sales-purchase.types';

export default function SalesInvoiceDetailsPage() {
  const { id } = useParams();
  const [salesInvoice, setSalesInvoice] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSalesInvoice(id);
    }
  }, [id]);

  async function loadSalesInvoice(salesInvoiceId: string) {
    try {
      setLoading(true);
      const data = await getSalesInvoice(salesInvoiceId);
      setSalesInvoice(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load sales invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const blob = await getSalesInvoicePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  const handlePost = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to post this sales invoice?')) {
      return;
    }
    try {
      await postSalesInvoice(id);
      loadSalesInvoice(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to post sales invoice');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to cancel this sales invoice?')) {
      return;
    }
    try {
      await cancelSalesInvoice(id);
      loadSalesInvoice(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to cancel sales invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/sales-invoices">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Sales Invoice Details</h1>
          <p className="text-slate-600 mt-1">View sales invoice information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          {salesInvoice?.status !== 'POSTED' && salesInvoice?.status !== 'CANCELLED' && (
            <>
              <Button variant="primary" size="sm" onClick={handlePost}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Post
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancel}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          <Link to={`/sales-purchase/sales-invoices/${id}/edit`}>
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
      ) : salesInvoice ? (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Invoice Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Customer</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{salesInvoice.customer?.customerName || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1 text-slate-900">{salesInvoice.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Invoice Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{new Date(salesInvoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Order</label>
                  <p className="mt-1 text-slate-900">{salesInvoice.salesOrder?.id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Discount</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-slate-900">{Number(salesInvoice.discount).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Item</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Unit Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesInvoice.items.map((item) => (
                      <tr key={item.itemId} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-900">{item.itemId}</td>
                        <td className="py-3 px-4 text-slate-900">{Number(item.quantity)}</td>
                        <td className="py-3 px-4 text-slate-900">₹{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-900">₹{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Invoice ID</label>
                  <p className="mt-1 text-slate-900">{salesInvoice.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesInvoice.createdAt ? new Date(salesInvoice.createdAt).toLocaleString() : '-'}</p>
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

import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Calendar, IndianRupee, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getSalesInvoice, postSalesInvoice, cancelSalesInvoice } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { SalesInvoice } from '../../types/sales-purchase.types';

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'POSTED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function paymentStatusBadgeClass(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function SalesInvoiceDetailsPage() {
  const { id } = useParams();
  const [salesInvoice, setSalesInvoice] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
      setError(getApiErrorMessage(err, 'Failed to load sales invoice'));
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: () => Promise<unknown>) => {
    if (!id) return;
    try {
      setActionLoading(true);
      await action();
      await loadSalesInvoice(id);
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(error, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    if (!salesInvoice) return;
    if (!window.confirm('Are you sure you want to cancel this sales invoice?')) return;
    handleAction(() => cancelSalesInvoice(salesInvoice.si_id));
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
        <div className="flex gap-2 flex-wrap">
          {salesInvoice?.status === 'DRAFT' && (
            <>
              <Link to={`/sales-purchase/sales-invoices/${id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="primary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => postSalesInvoice(salesInvoice.si_id))}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Post
              </Button>
            </>
          )}
          {salesInvoice?.status === 'POSTED' && (
            <Button variant="danger" size="sm" disabled={actionLoading} onClick={handleCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{salesInvoice.invoice_number}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Customer</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{salesInvoice.customer?.customer_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium', statusBadgeClass(salesInvoice.status))}>
                      {salesInvoice.status}
                    </span>
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium', paymentStatusBadgeClass(salesInvoice.payment_status))}>
                      {salesInvoice.payment_status} ({Number(salesInvoice.paid_amount || 0).toFixed(2)} paid)
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Invoice / Due Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesInvoice.invoice_date ? new Date(salesInvoice.invoice_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Due: {salesInvoice.due_date ? new Date(salesInvoice.due_date).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Order</label>
                  <p className="mt-1 text-slate-900">{salesInvoice.sales_order?.so_number || '-'}</p>
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
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Unit Price</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Line Discount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Tax</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(salesInvoice.items || []).map((item) => {
                      const taxAmount = Number(item.cgst_amount || 0) + Number(item.sgst_amount || 0) + Number(item.igst_amount || 0);
                      return (
                        <tr key={item.si_item_id} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-slate-900">{item.item?.item_name || item.item_id}</td>
                          <td className="py-3 px-4 text-slate-900 text-right">{item.quantity}</td>
                          <td className="py-3 px-4 text-slate-900 text-right">{Number(item.unit_price).toFixed(2)}</td>
                          <td className="py-3 px-4 text-slate-900 text-right">{Number(item.line_discount || 0).toFixed(2)}</td>
                          <td className="py-3 px-4 text-slate-900 text-right">{taxAmount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-slate-900 text-right">{Number(item.line_total).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{Number(salesInvoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (GST)</span>
                  <span className="text-slate-900">{Number(salesInvoice.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-slate-900">{Number(salesInvoice.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Grand Total</span>
                  <span className="text-slate-900 flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {Number(salesInvoice.grand_total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Paid</span>
                  <span className="text-slate-900">{Number(salesInvoice.paid_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {salesInvoice.receipts && salesInvoice.receipts.length > 0 && (
            <Card className="border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Receipts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
                        <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Mode</th>
                        <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Reference</th>
                        <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesInvoice.receipts.map((receipt) => (
                        <tr key={receipt.receipt_id} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{new Date(receipt.receipt_date).toLocaleDateString()}</td>
                          <td className="py-2 px-4 text-sm text-slate-900">{receipt.mode}</td>
                          <td className="py-2 px-4 text-sm text-slate-900">{receipt.reference_no || '-'}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(receipt.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Invoice ID</label>
                  <div className="mt-1 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesInvoice.si_id}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesInvoice.created_at ? new Date(salesInvoice.created_at).toLocaleString() : '-'}</p>
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

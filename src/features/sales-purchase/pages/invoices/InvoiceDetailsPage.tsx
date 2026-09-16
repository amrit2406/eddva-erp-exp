import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Calendar, Building2, IndianRupee, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getInvoice, postInvoice, cancelInvoice } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { Invoice } from '../../types/sales-purchase.types';

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

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  async function loadInvoice(invoiceId: string) {
    try {
      setLoading(true);
      const data = await getInvoice(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load invoice'));
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: () => Promise<unknown>) => {
    if (!id) return;
    try {
      setActionLoading(true);
      await action();
      await loadInvoice(id);
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
    if (!invoice) return;
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    handleAction(() => cancelInvoice(invoice.pi_id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/invoices">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Invoice Details</h1>
          <p className="text-slate-600 mt-1">View invoice information</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice?.status === 'DRAFT' && (
            <>
              <Link to={`/sales-purchase/invoices/${id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="primary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => postInvoice(invoice.pi_id))}>
                <Check className="h-4 w-4 mr-2" />
                Post
              </Button>
            </>
          )}
          {invoice?.status === 'POSTED' && (
            <Button variant="secondary" size="sm" disabled={actionLoading} onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
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
      ) : invoice ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Invoice Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{invoice.invoice_number}</div>
                <div className="text-xs text-slate-500 mt-1">Vendor ref: {invoice.vendor_invoice_number}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Vendor</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{invoice.vendor?.vendor_name || '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Invoice / Due Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : '-'}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                </div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{Number(invoice.grand_total || 0).toFixed(2)}</div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold', statusBadgeClass(invoice.status))}>
                  {invoice.status}
                </span>
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold', paymentStatusBadgeClass(invoice.payment_status))}>
                  {invoice.payment_status} ({Number(invoice.paid_amount || 0).toFixed(2)} paid)
                </span>
                {invoice.purchase_order?.po_number && (
                  <span className="text-sm text-slate-500">PO: {invoice.purchase_order.po_number}</span>
                )}
                {invoice.grn?.grn_number && (
                  <span className="text-sm text-slate-500">GRN: {invoice.grn.grn_number}</span>
                )}
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
                      <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Item</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Unit Price</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Line Discount</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Tax</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.items || []).map((item) => {
                      const taxAmount = Number(item.cgst_amount || 0) + Number(item.sgst_amount || 0) + Number(item.igst_amount || 0);
                      return (
                        <tr key={item.pi_item_id} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{item.item?.item_name || item.item_id}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.unit_price).toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.line_discount || 0).toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{taxAmount.toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.line_total).toFixed(2)}</td>
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
                  <span className="text-slate-900">{Number(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (GST)</span>
                  <span className="text-slate-900">{Number(invoice.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-slate-900">{Number(invoice.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Grand Total</span>
                  <span className="text-slate-900">{Number(invoice.grand_total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Paid</span>
                  <span className="text-slate-900">{Number(invoice.paid_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {invoice.payments && invoice.payments.length > 0 && (
            <Card className="border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Payments</h3>
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
                      {invoice.payments.map((payment) => (
                        <tr key={payment.payment_id} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td className="py-2 px-4 text-sm text-slate-900">{payment.mode}</td>
                          <td className="py-2 px-4 text-sm text-slate-900">{payment.reference_no || '-'}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(payment.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}

import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Calendar, Building2, IndianRupee, Check, Download, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getInvoice, getItems, postInvoice, cancelInvoice, validateInvoice, getInvoicePDF } from '../../api/sales-purchase.api';
import type { Invoice, Item } from '../../types/sales-purchase.types';

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [itemsMap, setItemsMap] = useState<Map<string, Item>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
      loadItems();
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
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }

  async function loadItems() {
    try {
      const data = await getItems();
      const map = new Map(data.map((item) => [item.id, item]));
      setItemsMap(map);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  }

  const handlePost = async () => {
    if (!id) return;
    try {
      await postInvoice(id);
      if (id) loadInvoice(id);
    } catch (error: any) {
      console.error('Failed to post invoice:', error);
      alert('Failed to post invoice');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await cancelInvoice(id);
      if (id) loadInvoice(id);
    } catch (error: any) {
      console.error('Failed to cancel invoice:', error);
      alert('Failed to cancel invoice');
    }
  };

  const handleValidate = async () => {
    if (!id) return;
    try {
      await validateInvoice(id);
      alert('Invoice validated successfully');
      if (id) loadInvoice(id);
    } catch (error: any) {
      console.error('Failed to validate invoice:', error);
      alert('Failed to validate invoice');
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const blob = await getInvoicePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF');
    }
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
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          {invoice?.status !== 'POSTED' && (
            <Button variant="secondary" size="sm" onClick={handleValidate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Validate
            </Button>
          )}
          {invoice?.status !== 'POSTED' && (
            <Button variant="secondary" size="sm" onClick={handlePost}>
              <Check className="h-4 w-4 mr-2" />
              Post
            </Button>
          )}
          {invoice?.status === 'POSTED' && (
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Link to={`/sales-purchase/invoices/${id}/edit`}>
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
      ) : invoice ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Invoice Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">INV-{invoice.id.slice(0, 8)}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Party</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{invoice.invoiceType === 'SALES' ? invoice.customer?.customerName : invoice.vendor?.vendorName || '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Invoice Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</div>
              </div>
            </Card>
          </div>

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
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => {
                      const itemDetails = itemsMap.get(item.itemId);
                      const unitPrice = Number(item.unitPrice) || 0;
                      return (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{itemDetails?.itemName || item.itemId}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{(item.quantity * unitPrice).toFixed(2)}</td>
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
                  <span className="text-slate-900">{invoice.items.reduce((sum, item) => sum + (item.quantity * (Number(item.unitPrice) || 0)), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-slate-900">{(Number(invoice.discount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{(invoice.items.reduce((sum, item) => sum + (item.quantity * (Number(item.unitPrice) || 0)), 0) - (Number(invoice.discount) || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

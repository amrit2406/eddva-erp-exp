import { useState, useEffect } from 'react';
import { Calendar, Building2, IndianRupee, FileText, Percent } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { getPurchaseRegister } from '../../api/sales-purchase.api';
import { cn } from '../../../../utils/cn';
import type { PurchaseRegisterItem, RegisterSummary } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

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

export default function PurchaseRegisterPage() {
  const [data, setData] = useState<PurchaseRegisterItem[]>([]);
  const [summary, setSummary] = useState<RegisterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const result = await getPurchaseRegister();
      setData(result.data);
      setSummary(result.summary);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load purchase register'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Purchase Register</h1>
        <p className="text-slate-600 mt-1">View all posted purchase invoice line items (Read-Only)</p>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-slate-200">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Invoices</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{summary.invoiceCount}</div>
                </div>
              </Card>
              <Card className="border-slate-200">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-sm font-medium">Subtotal</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{Number(summary.totalSubtotal).toLocaleString()}</div>
                </div>
              </Card>
              <Card className="border-slate-200">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Percent className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Tax</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{Number(summary.totalTax).toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    CGST {Number(summary.totalCgst).toLocaleString()} · SGST {Number(summary.totalSgst).toLocaleString()} · IGST {Number(summary.totalIgst).toLocaleString()}
                  </div>
                </div>
              </Card>
              <Card className="border-slate-200">
                <div className="p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-sm font-medium">Grand Total</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{Number(summary.totalGrandTotal).toLocaleString()}</div>
                </div>
              </Card>
            </div>
          )}

          <Card className="border-slate-200">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Vendor Invoice</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Invoice Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Qty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Taxable Value</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Tax</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Line Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500">
                          No purchase records found.
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => {
                        const tax = Number(item.cgst || 0) + Number(item.sgst || 0) + Number(item.igst || 0);
                        return (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="py-3 px-4 font-medium text-slate-900">{item.invoiceNumber}</td>
                            <td className="py-3 px-4 text-slate-600 hidden md:table-cell">{item.vendorInvoiceNumber}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <div className="text-sm text-slate-900">{item.vendor.vendor_name}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-900">{item.item?.item_name || '-'}</td>
                            <td className="py-3 px-4 text-sm text-slate-900 text-right">{item.quantity}</td>
                            <td className="py-3 px-4 text-sm text-slate-600 text-right hidden md:table-cell">{Number(item.taxableValue || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm text-slate-600 text-right hidden lg:table-cell">{tax.toFixed(2)}</td>
                            <td className="py-3 px-4 text-sm text-slate-900 text-right">{Number(item.lineTotal || 0).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', paymentStatusBadgeClass(item.paymentStatus))}>
                                {item.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

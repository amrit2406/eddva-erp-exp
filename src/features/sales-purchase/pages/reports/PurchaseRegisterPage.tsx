import { useState, useEffect } from 'react';
import { Calendar, Building2, IndianRupee, Eye, X } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPurchaseRegister } from '../../api/sales-purchase.api';
import type { PurchaseRegisterItem } from '../../types/sales-purchase.types';

export default function PurchaseRegisterPage() {
  const [data, setData] = useState<PurchaseRegisterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PurchaseRegisterItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const result = await getPurchaseRegister();
      setData(result);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load purchase register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Purchase Register</h1>
        <p className="text-slate-600 mt-1">View all purchase invoices (Read-Only)</p>
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
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Vendor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Invoice Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Grand Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Payment Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No purchase records found.
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-900">{item.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{item.vendorInvoiceNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <div className="text-sm text-slate-900">{item.vendor.vendorName}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {new Date(item.invoiceDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3 text-slate-400" />
                            {Number(item.grandTotal).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'POSTED' ? 'bg-green-100 text-green-800' : 
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                            item.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Purchase Register Details</h3>
                <button 
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">ID</label>
                    <p className="mt-1 text-slate-900">{selectedItem.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Invoice Number</label>
                    <p className="mt-1 text-slate-900">{selectedItem.invoiceNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Vendor Invoice Number</label>
                    <p className="mt-1 text-slate-900">{selectedItem.vendorInvoiceNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Vendor Code</label>
                    <p className="mt-1 text-slate-900">{selectedItem.vendor.vendorCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Vendor Name</label>
                    <p className="mt-1 text-slate-900">{selectedItem.vendor.vendorName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Vendor GSTIN</label>
                    <p className="mt-1 text-slate-900">{selectedItem.vendor.gstin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Invoice Date</label>
                    <p className="mt-1 text-slate-900">{new Date(selectedItem.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Due Date</label>
                    <p className="mt-1 text-slate-900">{new Date(selectedItem.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Subtotal</label>
                    <p className="mt-1 text-slate-900">₹{Number(selectedItem.subtotal).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Tax Amount</label>
                    <p className="mt-1 text-slate-900">₹{Number(selectedItem.taxAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Discount</label>
                    <p className="mt-1 text-slate-900">₹{Number(selectedItem.discount).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Grand Total</label>
                    <p className="mt-1 text-slate-900">₹{Number(selectedItem.grandTotal).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Status</label>
                    <p className="mt-1 text-slate-900">{selectedItem.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">Payment Status</label>
                    <p className="mt-1 text-slate-900">{selectedItem.paymentStatus}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 mb-2 block">Items</label>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-700">Item</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-700">Qty</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-700">Unit Price</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-700">CGST</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-700">SGST</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-slate-700">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.items.map((item) => (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="py-2 px-3 text-sm text-slate-900">{item.item.itemName}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">{Number(item.quantity)}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">₹{Number(item.unitPrice).toFixed(2)}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">₹{Number(item.cgstAmount).toFixed(2)}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">₹{Number(item.sgstAmount).toFixed(2)}</td>
                            <td className="py-2 px-3 text-sm text-slate-600">₹{Number(item.lineTotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

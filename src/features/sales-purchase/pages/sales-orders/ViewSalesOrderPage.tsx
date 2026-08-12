import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Building } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { mockSalesOrders, mockSalesOrderItems } from '../../mock/sales.mock';
import { SALES_ORDER_STATUS_COLORS } from '../../constants/sales.constants';

export default function ViewSalesOrderPage() {
  const { id } = useParams<{ id: string }>();
  const so = mockSalesOrders.find((s) => s.soId === id);
  const items = mockSalesOrderItems.filter((i) => i.soId === id);

  if (!so) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/sales-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Order Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/sales-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{so.soNumber}</h1>
            <p className="text-slate-600 mt-1">{so.customerName}</p>
          </div>
        </div>
        <Link to={`/sales-purchase/sales-orders/${so.soId}/edit`}>
          <Button variant="primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit SO
          </Button>
        </Link>
      </div>

      {/* Basic Information */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">SO Number</label>
              <p className="font-medium text-slate-900">{so.soNumber}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Status</label>
              <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', SALES_ORDER_STATUS_COLORS[so.status])}>
                {so.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div>
              <label className="text-sm text-slate-600">SO Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-900">{new Date(so.soDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Delivery Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-900">{so.deliveryDate ? new Date(so.deliveryDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Created By</label>
              <p className="font-medium text-slate-900">{so.createdByName || '-'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h3>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Item</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Quantity</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Unit Price</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Tax</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Line Total</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Invoiced</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.soItemId} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-sm">{item.itemName}</td>
                      <td className="py-2 px-3 text-sm">{item.quantity}</td>
                      <td className="py-2 px-3 text-sm">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 text-sm">{item.taxCodeName || '-'}</td>
                      <td className="py-2 px-3 text-sm font-medium">₹{item.lineTotal.toLocaleString()}</td>
                      <td className="py-2 px-3 text-sm">{item.invoicedQty}/{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500">No items in this sales order</p>
          )}
        </div>
      </Card>

      {/* Order Summary */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">₹{so.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax Amount</span>
              <span className="font-medium">₹{so.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium">₹{so.discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
              <span className="text-slate-900">Grand Total</span>
              <span className="text-slate-900">₹{so.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

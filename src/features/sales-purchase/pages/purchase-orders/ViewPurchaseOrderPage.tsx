import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Building } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { mockPurchaseOrders, mockPurchaseOrderItems } from '../../mock/purchase.mock';
import { PURCHASE_ORDER_STATUS_COLORS } from '../../constants/purchase.constants';

export default function ViewPurchaseOrderPage() {
  const { id } = useParams<{ id: string }>();
  const po = mockPurchaseOrders.find((p) => p.poId === id);
  const items = mockPurchaseOrderItems.filter((i) => i.poId === id);

  if (!po) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/purchase-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Order Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/purchase-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{po.poNumber}</h1>
            <p className="text-slate-600 mt-1">{po.vendorName}</p>
          </div>
        </div>
        <Link to={`/sales-purchase/purchase-orders/${po.poId}/edit`}>
          <Button variant="primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit PO
          </Button>
        </Link>
      </div>

      {/* Basic Information */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">PO Number</label>
              <p className="font-medium text-slate-900">{po.poNumber}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Status</label>
              <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', PURCHASE_ORDER_STATUS_COLORS[po.status])}>
                {po.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div>
              <label className="text-sm text-slate-600">PO Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-900">{new Date(po.poDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Expected Delivery</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-900">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Warehouse</label>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-900">{po.warehouseName || '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Created By</label>
              <p className="font-medium text-slate-900">{po.createdByName || '-'}</p>
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
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.poItemId} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-sm">{item.itemName}</td>
                      <td className="py-2 px-3 text-sm">{item.quantity}</td>
                      <td className="py-2 px-3 text-sm">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 px-3 text-sm">{item.taxCodeName || '-'}</td>
                      <td className="py-2 px-3 text-sm font-medium">₹{item.lineTotal.toLocaleString()}</td>
                      <td className="py-2 px-3 text-sm">{item.receivedQty}/{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500">No items in this purchase order</p>
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
              <span className="font-medium">₹{po.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax Amount</span>
              <span className="font-medium">₹{po.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium">₹{po.discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
              <span className="text-slate-900">Grand Total</span>
              <span className="text-slate-900">₹{po.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
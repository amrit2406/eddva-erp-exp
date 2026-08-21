import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getOrders, deleteOrder, updateOrderStatus } from '../../api/canteen.api';
import type { Order, OrderStatus } from '../../types/canteen.types';

const STATUS_OPTIONS: OrderStatus[] = ['PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

const statusStyles: Record<OrderStatus, string> = {
  PLACED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-yellow-100 text-yellow-700',
  READY: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(id);
      setOrders(orders.filter((o) => o.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(orderId);
      const updated = await updateOrderStatus(orderId, { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600 mt-1">Manage canteen orders</p>
        </div>
        <Link to="/canteen/orders/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Order
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
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Member ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Terminal ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{order.id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{order.memberId.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-slate-600">{order.terminalId.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-slate-600">{order.items.length} items</td>
                      <td className="py-3 px-4 text-slate-600">₹{order.totalAmount || 0}</td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          disabled={updatingStatus === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008BE9] disabled:opacity-50 disabled:cursor-wait ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/canteen/orders/${order.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Receipt, Clock, User, Monitor, XCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getOrder, deleteOrder, updateOrderStatus, getMembers, getPosTerminals, getMenuItems } from '../../api/canteen.api';
import type { Order, OrderStatus } from '../../types/canteen.types';

const STATUS_OPTIONS: OrderStatus[] = ['PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

const statusStyles: Record<OrderStatus, string> = {
  PLACED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-yellow-100 text-yellow-700',
  READY: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  PLACED: <Clock className="h-4 w-4" />,
  PREPARING: <Clock className="h-4 w-4" />,
  READY: <CheckCircle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [orderData, membersData, terminalsData, menuItemsData] = await Promise.all([
        getOrder(id),
        getMembers(),
        getPosTerminals(),
        getMenuItems(),
      ]);
      setOrder(orderData);
      setMembers(membersData);
      setTerminals(terminalsData);
      setMenuItems(menuItemsData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(id);
      navigate('/canteen/orders');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!id) return;
    try {
      setUpdatingStatus(true);
      const updated = await updateOrderStatus(id, { status: newStatus });
      setOrder({ ...order!, status: updated.status });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : memberId.slice(0, 8) + '...';
  };

  const getTerminalName = (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId);
    return terminal ? terminal.name : terminalId.slice(0, 8) + '...';
  };

  const getMenuItemName = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    return item ? item.name : itemId.slice(0, 8) + '...';
  };

  const getMenuItemPrice = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    return item ? item.price : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/canteen/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/canteen/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error || 'Order not found'}</div>
        </Card>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => {
    const price = getMenuItemPrice(item.itemId);
    return sum + (price * item.quantity);
  }, 0);

  const discount = order.discountAmount || 0;
  const total = subtotal - discount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/canteen/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
            <p className="text-slate-600 mt-1">View order information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/canteen/orders/${order.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Order Information</h2>
                <div className="flex items-center gap-2">
                  {statusIcons[order.status]}
                  <select
                    value={order.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    className={`text-sm font-medium px-3 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008BE9] disabled:opacity-50 disabled:cursor-wait ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Receipt className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Order ID</p>
                    <p className="font-medium text-slate-900">{order.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Member</p>
                    <p className="font-medium text-slate-900">{getMemberName(order.memberId)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Terminal</p>
                    <p className="font-medium text-slate-900">{getTerminalName(order.terminalId)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Created At</p>
                    <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>
              {order.items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                  No items in this order
                </div>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{getMenuItemName(item.itemId)}</p>
                        <p className="text-sm text-slate-500">Quantity: {item.quantity} × ₹{getMenuItemPrice(item.itemId)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">₹{getMenuItemPrice(item.itemId) * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Discount</span>
                    <span className="font-medium text-red-600">-₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-bold text-lg text-slate-900">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to={`/canteen/orders/${order.id}/edit`} className="block">
                  <Button variant="secondary" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                </Link>
                <Button variant="danger" className="w-full" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
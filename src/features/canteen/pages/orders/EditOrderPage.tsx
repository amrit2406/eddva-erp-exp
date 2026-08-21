import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import {
  getOrder,
  updateOrder,
  getMembers,
  getPosTerminals,
  getMenuItems,
  updateOrderItem,
  deleteOrderItem,
  addOrderItem,
  getOrderItems,
  updateOrderStatus,
} from '../../api/canteen.api';
import type { CanteenMember, PosTerminal, MenuItem, OrderItemDetail, OrderStatus } from '../../types/canteen.types';

const STATUS_OPTIONS: OrderStatus[] = ['PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export default function EditOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [members, setMembers] = useState<CanteenMember[]>([]);
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);

  const [formData, setFormData] = useState({
    memberId: '',
    terminalId: '',
    discountAmount: 0,
    status: 'PLACED' as OrderStatus,
  });

  // New item being added via POST /orders/{id}/items
  const [newItem, setNewItem] = useState({ itemId: '', quantity: 1 });
  const [addingItem, setAddingItem] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [orderData, membersData, terminalsData, itemsData, orderItemsData] = await Promise.all([
        getOrder(id),
        getMembers(),
        getPosTerminals(),
        getMenuItems(),
        getOrderItems(id),        // GET /canteen/orders/{orderId}/items
      ]);
      setMembers(membersData);
      setTerminals(terminalsData);
      setMenuItems(itemsData);
      setOrderItems(orderItemsData);
      setFormData({
        memberId: orderData.memberId,
        terminalId: orderData.terminalId,
        discountAmount: orderData.discountAmount,
        status: orderData.status || 'PLACED',
      });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // POST /canteen/orders/{orderId}/items
  const handleAddItem = async () => {
    if (!id || !newItem.itemId || newItem.quantity < 1) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }
    try {
      setAddingItem(true);
      const added = await addOrderItem(id, { itemId: newItem.itemId, quantity: newItem.quantity });
      setOrderItems((prev) => [...prev, added]);
      setNewItem({ itemId: '', quantity: 1 });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  // PATCH /canteen/orders/{orderId}/items/{itemId}
  const handleUpdateQuantity = async (item: OrderItemDetail, quantity: number) => {
    if (!id) return;
    try {
      await updateOrderItem(id, item.id, { quantity });
      setOrderItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantity } : i))
      );
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to update item quantity');
    }
  };

  // DELETE /canteen/orders/{orderId}/items/{itemId}
  const handleRemoveItem = async (item: OrderItemDetail) => {
    if (!id) return;
    try {
      await deleteOrderItem(id, item.id);
      setOrderItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to remove item');
    }
  };

  // PATCH /canteen/orders/{id}/status
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!id) return;
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(id, { status: newStatus });
      setFormData((prev) => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // PATCH /canteen/orders/{id}  (member, terminal, discount)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.memberId || !formData.terminalId) {
      setError('Please select member and terminal');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await updateOrder(id, {
        memberId: formData.memberId,
        terminalId: formData.terminalId,
        discountAmount: Number(formData.discountAmount),
        items: orderItems.map((i) => ({ id: i.id, itemId: i.itemId, quantity: i.quantity })),
      });
      navigate('/canteen/orders', { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update order';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Order</h1>
          <p className="text-slate-600 mt-1">Update canteen order</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Order</h1>
        <p className="text-slate-600 mt-1">Update canteen order</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-slate-700 mb-1">
                  Member *
                </label>
                <select
                  id="memberId"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="terminalId" className="block text-sm font-medium text-slate-700 mb-1">
                  Terminal *
                </label>
                <select
                  id="terminalId"
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="">Select a terminal</option>
                  {terminals.map((terminal) => (
                    <option key={terminal.id} value={terminal.id}>{terminal.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="discountAmount" className="block text-sm font-medium text-slate-700 mb-1">
                  Discount Amount
                </label>
                <input
                  type="number"
                  id="discountAmount"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  step="0.01"
                />
              </div>

              {/* Status — uses PATCH /canteen/orders/{id}/status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:opacity-60 disabled:cursor-wait"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {updatingStatus && (
                  <p className="text-xs text-slate-500 mt-1">Updating status...</p>
                )}
              </div>
            </div>

            {/* Order Items — loaded via GET /canteen/orders/{id}/items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
                <span className="text-sm text-slate-500">{orderItems.length} item(s)</span>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                  No items in this order. Add items below.
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {orderItems.map((item) => {
                    const menuItem = item.menuItem ?? menuItems.find((m) => m.id === item.itemId);
                    return (
                      <div key={item.id} className="flex gap-3 items-center bg-slate-50 rounded-lg px-3 py-2">
                        <span className="flex-1 text-sm font-medium text-slate-800">
                          {menuItem?.name ?? item.itemId}
                          {menuItem && (
                            <span className="ml-2 text-xs text-slate-500">₹{menuItem.price}</span>
                          )}
                        </span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item, parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                          min="1"
                        />
                        {item.totalPrice != null && (
                          <span className="text-sm text-slate-600 w-20 text-right">₹{item.totalPrice}</span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new item — POST /canteen/orders/{id}/items */}
              <div className="border border-dashed border-slate-300 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Add New Item</p>
                <div className="flex gap-3 items-center">
                  <select
                    value={newItem.itemId}
                    onChange={(e) => setNewItem({ ...newItem, itemId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent text-sm"
                  >
                    <option value="">Select item</option>
                    {menuItems.map((menuItem) => (
                      <option key={menuItem.id} value={menuItem.id}>
                        {menuItem.name} — ₹{menuItem.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent text-sm"
                    min="1"
                    placeholder="Qty"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={addingItem || !newItem.itemId}
                  >
                    {addingItem ? 'Adding...' : 'Add Item'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/canteen/orders')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Order'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

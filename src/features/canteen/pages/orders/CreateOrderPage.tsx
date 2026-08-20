import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createOrder, getMembers, getPosTerminals, getMenuItems } from '../../api/canteen.api';
import type { CanteenMember, PosTerminal, MenuItem, OrderItem } from '../../types/canteen.types';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<CanteenMember[]>([]);
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState({
    memberId: '',
    terminalId: '',
    discountAmount: 0,
    status: 'PLACED' as 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED',
    items: [] as OrderItem[]
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [membersData, terminalsData, itemsData] = await Promise.all([
        getMembers(),
        getPosTerminals(),
        getMenuItems()
      ]);
      setMembers(membersData);
      setTerminals(terminalsData);
      setMenuItems(itemsData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: 1 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !formData.terminalId) {
      setError('Please select member and terminal');
      return;
    }
    if (formData.items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    const validItems = formData.items.filter(item => item.itemId && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Please add valid items');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createOrder({
        ...formData,
        discountAmount: Number(formData.discountAmount),
        items: validItems
      });
      navigate('/canteen/orders');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      const errorMessage = err.response?.data?.error?.message || 
                           err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Failed to create order';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Order</h1>
          <p className="text-slate-600 mt-1">Create a new canteen order</p>
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
        <h1 className="text-2xl font-bold text-slate-900">Create Order</h1>
        <p className="text-slate-600 mt-1">Create a new canteen order</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
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
                    <option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </option>
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

              {/* <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="PLACED">Placed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div> */}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
                <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                  Add Item
                </Button>
              </div>
              
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                  No items added. Click "Add Item" to add items to the order.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                      >
                        <option value="">Select item</option>
                        {menuItems.map((menuItem) => (
                          <option key={menuItem.id} value={menuItem.id}>
                            {menuItem.name} - ₹{menuItem.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                        min="1"
                        placeholder="Qty"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                {submitting ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

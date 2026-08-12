import { useState } from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { Plus, Trash2, IndianRupee } from 'lucide-react';
import { mockCustomers } from '../../mock/customers.mock';
import { mockItems } from '../../mock/shared.mock';
import { mockTaxCodes } from '../../mock/shared.mock';

interface OrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxCodeId: string;
}

export default function SalesOrderForm() {
  const [formData, setFormData] = useState({
    customerId: '',
    soDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<OrderItem>({
    itemId: '',
    quantity: 1,
    unitPrice: 0,
    taxCodeId: '',
  });

  const handleAddItem = () => {
    if (newItem.itemId && newItem.quantity > 0) {
      setItems([...items, { ...newItem }]);
      setNewItem({
        itemId: '',
        quantity: 1,
        unitPrice: 0,
        taxCodeId: '',
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const taxCode = mockTaxCodes.find((t) => t.taxCodeId === item.taxCodeId);
      
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      
      if (taxCode) {
        taxAmount += lineTotal * (taxCode.cgstPct + taxCode.sgstPct) / 100;
      }
    });

    return {
      subtotal,
      taxAmount,
      grandTotal: subtotal + taxAmount,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating sales order:', { ...formData, items, totals });
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <Select
                name="customerId"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                placeholder="Select customer"
                options={mockCustomers.map((c) => ({ value: c.customerId, label: c.customerName }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SO Date <span className="text-red-500">*</span>
              </label>
              <Input
                name="soDate"
                type="date"
                value={formData.soDate}
                onChange={(e) => setFormData({ ...formData, soDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Date</label>
              <Input
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h3>
          
          {/* Add Item Form */}
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Item</label>
                <Select
                  value={newItem.itemId}
                  onChange={(e) => {
                    const item = mockItems.find((i) => i.itemId === e.target.value);
                    setNewItem({
                      ...newItem,
                      itemId: e.target.value,
                      unitPrice: item?.salesPrice || 0,
                    });
                  }}
                  placeholder="Select item"
                  options={mockItems.map((i) => ({ value: i.itemId, label: `${i.itemCode} - ${i.itemName}` }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Code</label>
                <Select
                  value={newItem.taxCodeId}
                  onChange={(e) => setNewItem({ ...newItem, taxCodeId: e.target.value })}
                  placeholder="Select tax"
                  options={mockTaxCodes.map((t) => ({ value: t.taxCodeId, label: t.name }))}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddItem}
              className="mt-4"
              disabled={!newItem.itemId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Item</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Quantity</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Unit Price</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Tax</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Line Total</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const itemData = mockItems.find((i) => i.itemId === item.itemId);
                    const taxCode = mockTaxCodes.find((t) => t.taxCodeId === item.taxCodeId);
                    const lineTotal = item.quantity * item.unitPrice;

                    return (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-2 px-3 text-sm">{itemData?.itemName || '-'}</td>
                        <td className="py-2 px-3 text-sm">{item.quantity}</td>
                        <td className="py-2 px-3 text-sm">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 text-sm">{taxCode?.name || '-'}</td>
                        <td className="py-2 px-3 text-sm font-medium">₹{lineTotal.toLocaleString()}</td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Totals */}
      {items.length > 0 && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax Amount</span>
                <span className="font-medium">₹{totals.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                <span className="text-slate-900">Grand Total</span>
                <span className="text-slate-900">₹{totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button variant="secondary" type="button" className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={items.length === 0} className="w-full sm:w-auto">
          Create Sales Order
        </Button>
      </div>
    </form>
  );
}

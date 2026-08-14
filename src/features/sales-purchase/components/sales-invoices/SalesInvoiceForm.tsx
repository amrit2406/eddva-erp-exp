import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useState, useEffect } from 'react';
import { getCustomers, getSalesOrders, getItems, getTaxCodes } from '../../api/sales-purchase.api';
import type { SalesInvoiceFormData, SalesInvoiceItem, Customer, SalesOrder, Item, TaxCode } from '../../types/sales-purchase.types';

interface SalesInvoiceFormProps {
  defaultValues?: SalesInvoiceFormData;
  onSubmit?: (data: SalesInvoiceFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function SalesInvoiceForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: SalesInvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceItems, setInvoiceItems] = useState<SalesInvoiceItem[]>(
    defaultValues?.items || [{ itemId: '', quantity: 0, unitPrice: 0, taxCodeId: '' }]
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [customersData, salesOrdersData, itemsData, taxCodesData] = await Promise.all([
        getCustomers(),
        getSalesOrders(),
        getItems(),
        getTaxCodes(),
      ]);
      setCustomers(customersData);
      setSalesOrders(salesOrdersData);
      setItems(itemsData);
      setTaxCodes(taxCodesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { itemId: '', quantity: 0, unitPrice: 0, taxCodeId: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof SalesInvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: SalesInvoiceFormData = {
      customerId: formData.get('customerId') as string,
      soId: formData.get('soId') as string || undefined,
      invoiceDate: formData.get('invoiceDate') as string,
      discount: Number(formData.get('discount')) || 0,
      items: invoiceItems,
    };

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {loading ? (
        <div className="text-center text-slate-500 py-8">Loading data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                defaultValue={defaultValues?.customerId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sales Order</label>
              <select
                name="soId"
                defaultValue={defaultValues?.soId || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select sales order (optional)</option>
                {salesOrders.map((salesOrder) => (
                  <option key={salesOrder.id} value={salesOrder.id}>
                    {salesOrder.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <Input
                name="invoiceDate"
                type="date"
                defaultValue={defaultValues?.invoiceDate ? new Date(defaultValues.invoiceDate).toISOString().split('T')[0] : ''}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount</label>
              <Input
                name="discount"
                type="number"
                step="0.01"
                defaultValue={defaultValues?.discount || 0}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Items</h3>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {invoiceItems.length > 0 ? (
              <div className="space-y-3">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Item #{index + 1}</span>
                      {invoiceItems.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Item</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                        >
                          <option value="">Select item</option>
                          {items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.itemName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax Code</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.taxCodeId}
                          onChange={(e) => handleItemChange(index, 'taxCodeId', e.target.value)}
                        >
                          <option value="">Select tax code</option>
                          {taxCodes.map((taxCode) => (
                            <option key={taxCode.id} value={taxCode.id}>
                              {taxCode.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                No items added. Click "Add Item" to add items.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Saving...' : submitText}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

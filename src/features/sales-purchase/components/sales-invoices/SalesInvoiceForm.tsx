import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useState, useEffect } from 'react';
import { getCustomers, getSalesOrders, getSalesOrder, getItems, getTaxCodes } from '../../api/sales-purchase.api';
import type { SalesInvoiceFormData, SalesInvoiceItemFormData, Customer, SalesOrder, Item, TaxCode } from '../../types/sales-purchase.types';

interface SalesInvoiceFormProps {
  defaultValues?: SalesInvoiceFormData;
  onSubmit?: (data: SalesInvoiceFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

const emptyLine: SalesInvoiceItemFormData = { item_id: 0, quantity: 0, unit_price: 0, tax_code_id: 0, line_discount: 0 };

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
  const [invoiceItems, setInvoiceItems] = useState<SalesInvoiceItemFormData[]>(
    defaultValues?.items && defaultValues.items.length > 0 ? defaultValues.items : [{ ...emptyLine }]
  );
  const [selectedSOId, setSelectedSOId] = useState<string>(defaultValues?.sales_order_id ? String(defaultValues.sales_order_id) : '');
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedSOId) {
      setSelectedSO(null);
      return;
    }
    getSalesOrder(selectedSOId)
      .then(setSelectedSO)
      .catch((error) => {
        console.error('Failed to load sales order items:', error);
        setSelectedSO(null);
      });
  }, [selectedSOId]);

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
    setInvoiceItems([...invoiceItems, { ...emptyLine }]);
  };

  const handleRemoveItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof SalesInvoiceItemFormData, value: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceItems(updatedItems);
  };

  const applySOItem = (index: number, soItemId: number) => {
    const soItem = selectedSO?.items?.find((i) => i.so_item_id === soItemId);
    const updatedItems = [...invoiceItems];
    updatedItems[index] = {
      ...updatedItems[index],
      so_item_id: soItemId || undefined,
      item_id: soItem?.item_id || updatedItems[index].item_id,
      unit_price: soItem ? Number(soItem.unit_price) : updatedItems[index].unit_price,
      tax_code_id: soItem?.tax_code_id || updatedItems[index].tax_code_id,
    };
    setInvoiceItems(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const data: SalesInvoiceFormData = {
      customer_id: Number(formData.get('customer_id')),
      invoice_date: formData.get('invoice_date') as string,
      discount: Number(formData.get('discount')) || 0,
      items: invoiceItems.filter((item) => item.item_id && item.quantity > 0),
    };

    if (selectedSOId) data.sales_order_id = Number(selectedSOId);

    const dueDate = formData.get('due_date') as string;
    if (dueDate) data.due_date = dueDate;

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
                name="customer_id"
                defaultValue={defaultValues?.customer_id ? String(defaultValues.customer_id) : ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.customer_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sales Order</label>
              <select
                value={selectedSOId}
                onChange={(e) => setSelectedSOId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select sales order (optional)</option>
                {salesOrders.map((salesOrder) => (
                  <option key={salesOrder.so_id} value={salesOrder.so_id}>
                    {salesOrder.so_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <Input
                name="invoice_date"
                type="date"
                defaultValue={defaultValues?.invoice_date?.split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <Input
                name="due_date"
                type="date"
                defaultValue={defaultValues?.due_date?.split('T')[0]}
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
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
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
                          value={item.item_id || ''}
                          onChange={(e) => handleItemChange(index, 'item_id', Number(e.target.value))}
                        >
                          <option value="">Select item</option>
                          {items.map((itemOption) => (
                            <option key={itemOption.item_id} value={itemOption.item_id}>
                              {itemOption.item_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                        <Input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price || ''}
                          onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax Code</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.tax_code_id || ''}
                          onChange={(e) => handleItemChange(index, 'tax_code_id', Number(e.target.value))}
                        >
                          <option value="">Select tax code</option>
                          {taxCodes.map((taxCode) => (
                            <option key={taxCode.tax_code_id} value={taxCode.tax_code_id}>
                              {taxCode.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Link SO Line</label>
                        <select
                          value={item.so_item_id || ''}
                          onChange={(e) => applySOItem(index, Number(e.target.value))}
                          disabled={!selectedSO}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                        >
                          <option value="">{selectedSO ? 'None' : 'Select a sales order above first'}</option>
                          {selectedSO?.items?.map((soItem) => (
                            <option key={soItem.so_item_id} value={soItem.so_item_id}>
                              {soItem.item?.item_name || soItem.item_id} (qty {soItem.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Line Discount</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.line_discount || ''}
                          onChange={(e) => handleItemChange(index, 'line_discount', Number(e.target.value))}
                          placeholder="0.00"
                        />
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

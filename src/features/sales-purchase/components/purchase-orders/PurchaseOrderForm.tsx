import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { PurchaseOrderFormData, PurchaseOrderItemFormData } from '../../types/sales-purchase.types';
import { getVendors, getWarehouses, getItems, getTaxCodes } from '../../api/sales-purchase.api';
import type { Vendor, Warehouse, Item, TaxCode } from '../../types/sales-purchase.types';

interface PurchaseOrderFormProps {
  defaultValues?: PurchaseOrderFormData;
  onSubmit?: (data: PurchaseOrderFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

const emptyLine: PurchaseOrderItemFormData = { item_id: 0, quantity: 0, unit_price: 0, tax_code_id: 0, line_discount: 0 };

export default function PurchaseOrderForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: PurchaseOrderFormProps) {
  const [items, setItems] = useState<PurchaseOrderItemFormData[]>(
    defaultValues?.items && defaultValues.items.length > 0 ? defaultValues.items : [{ ...emptyLine }]
  );
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [vendorsData, warehousesData, itemsData, taxCodesData] = await Promise.all([
        getVendors(),
        getWarehouses(),
        getItems(),
        getTaxCodes(),
      ]);
      setVendors(vendorsData);
      setWarehouses(warehousesData);
      setItemsList(itemsData);
      setTaxCodes(taxCodesData);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    } finally {
      setLoading(false);
    }
  }

  const addItem = () => {
    setItems([...items, { ...emptyLine }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItemFormData, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const data: PurchaseOrderFormData = {
      vendor_id: Number(formData.get('vendor_id')),
      po_date: formData.get('po_date') as string,
      expected_delivery_date: formData.get('expected_delivery_date') as string,
      warehouse_id: Number(formData.get('warehouse_id')),
      discount: formData.get('discount') ? Number(formData.get('discount')) : 0,
      items: items.filter((item) => item.item_id && item.quantity > 0),
    };

    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading dropdown options...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendor_id"
                defaultValue={defaultValues?.vendor_id ? String(defaultValues.vendor_id) : ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.vendor_id} value={vendor.vendor_id}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouse_id"
                defaultValue={defaultValues?.warehouse_id ? String(defaultValues.warehouse_id) : ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                PO Date <span className="text-red-500">*</span>
              </label>
              <Input
                name="po_date"
                type="date"
                defaultValue={defaultValues?.po_date?.split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expected Delivery Date
              </label>
              <Input
                name="expected_delivery_date"
                type="date"
                defaultValue={defaultValues?.expected_delivery_date?.split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount</label>
              <Input
                name="discount"
                type="number"
                defaultValue={defaultValues?.discount || 0}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Items</h3>
              <Button variant="secondary" size="sm" type="button" onClick={addItem}>
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Item</label>
                    <select
                      value={item.item_id || ''}
                      onChange={(e) => updateItem(index, 'item_id', Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select item</option>
                      {itemsList.map((itemOption) => (
                        <option key={itemOption.item_id} value={itemOption.item_id}>
                          {itemOption.item_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                    <Input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      min="1"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Unit Price</label>
                    <Input
                      type="number"
                      value={item.unit_price || ''}
                      onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Line Discount</label>
                    <Input
                      type="number"
                      value={item.line_discount || ''}
                      onChange={(e) => updateItem(index, 'line_discount', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Tax Code</label>
                      <select
                        value={item.tax_code_id || ''}
                        onChange={(e) => updateItem(index, 'tax_code_id', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select tax</option>
                        {taxCodes.map((taxCode) => (
                          <option key={taxCode.tax_code_id} value={taxCode.tax_code_id}>
                            {taxCode.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { PurchaseOrderFormData, PurchaseOrderItem } from '../../types/sales-purchase.types';
import { getVendors, getWarehouses, getItems, getTaxCodes } from '../../api/sales-purchase.api';
import type { Vendor, Warehouse, Item, TaxCode } from '../../types/sales-purchase.types';

interface PurchaseOrderFormProps {
  defaultValues?: PurchaseOrderFormData;
  onSubmit?: (data: PurchaseOrderFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function PurchaseOrderForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: PurchaseOrderFormProps) {
  const [items, setItems] = useState<PurchaseOrderItem[]>(
    defaultValues?.items || [{ id: crypto.randomUUID(), itemId: '', quantity: 0, unitPrice: 0, taxCodeId: '' }]
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
    setItems([...items, { id: crypto.randomUUID(), itemId: '', quantity: 0, unitPrice: 0, taxCodeId: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: PurchaseOrderItem, i: number) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: PurchaseOrderFormData = {
      vendorId: formData.get('vendorId') as string,
      poDate: formData.get('poDate') as string,
      expectedDeliveryDate: formData.get('expectedDeliveryDate') as string,
      warehouseId: formData.get('warehouseId') as string,
      discount: formData.get('discount') ? Number(formData.get('discount')) : 0,
      items: items.filter(item => item.itemId && item.quantity > 0),
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
                name="vendorId"
                defaultValue={defaultValues?.vendorId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                defaultValue={defaultValues?.warehouseId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
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
            name="poDate"
            type="date"
            defaultValue={defaultValues?.poDate?.split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Expected Delivery Date <span className="text-red-500">*</span>
          </label>
          <Input
            name="expectedDeliveryDate"
            type="date"
            defaultValue={defaultValues?.expectedDeliveryDate?.split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Discount (%)</label>
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
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Item</label>
                <select
                  value={item.itemId}
                  onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select item</option>
                  {itemsList.map((itemOption) => (
                    <option key={itemOption.id} value={itemOption.id}>
                      {itemOption.itemName}
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
                  value={item.unitPrice || ''}
                  onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="text-sm"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tax Code</label>
                  <select
                    value={item.taxCodeId}
                    onChange={(e) => updateItem(index, 'taxCodeId', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select tax</option>
                    {taxCodes.map((taxCode) => (
                      <option key={taxCode.id} value={taxCode.id}>
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

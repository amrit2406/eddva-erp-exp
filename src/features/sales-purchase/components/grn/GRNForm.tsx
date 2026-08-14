import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { GRNFormData, GRNItem } from '../../types/sales-purchase.types';
import { getPurchaseOrders, getWarehouses, getVendors, getItems } from '../../api/sales-purchase.api';
import type { PurchaseOrder, Warehouse, Vendor, Item } from '../../types/sales-purchase.types';

interface GRNFormProps {
  defaultValues?: GRNFormData;
  onSubmit?: (data: GRNFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function GRNForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: GRNFormProps) {
  const [items, setItems] = useState<GRNItem[]>(
    defaultValues?.items || [{ poItemId: '', itemId: '', receivedQty: 0, acceptedQty: 0, rejectedQty: 0 }]
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedPOId, setSelectedPOId] = useState<string>(defaultValues?.poId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [purchaseOrdersData, warehousesData, vendorsData, itemsData] = await Promise.all([
        getPurchaseOrders(),
        getWarehouses(),
        getVendors(),
        getItems(),
      ]);
      setPurchaseOrders(purchaseOrdersData);
      setWarehouses(warehousesData);
      setVendors(vendorsData);
      setItemsList(itemsData);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    } finally {
      setLoading(false);
    }
  }

  const addItem = () => {
    setItems([...items, { poItemId: '', itemId: '', receivedQty: 0, acceptedQty: 0, rejectedQty: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: GRNItem, i: number) => i !== index));
  };

  const updateItem = (index: number, field: keyof GRNItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleItemChange = (index: number, itemId: string) => {
    const selectedPO = purchaseOrders.find(po => po.id === selectedPOId);
    const poItem = selectedPO?.items?.find(item => item.itemId === itemId);
    const newItems = [...items];
    newItems[index] = { 
      ...newItems[index], 
      itemId,
      poItemId: poItem?.id || itemId 
    };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: GRNFormData = {
      poId: formData.get('poId') as string,
      vendorId: formData.get('vendorId') as string,
      receivedDate: new Date(formData.get('receivedDate') as string).toISOString(),
      warehouseId: formData.get('warehouseId') as string,
      items: items.filter(item => item.itemId && item.receivedQty > 0).map(item => ({
        ...item,
        poItemId: item.poItemId || item.itemId
      })),
    };

    console.log('Submitting GRN data:', JSON.stringify(data, null, 2));
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
                Purchase Order <span className="text-red-500">*</span>
              </label>
              <select
                name="poId"
                defaultValue={defaultValues?.poId}
                onChange={(e) => setSelectedPOId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select purchase order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    PO-{po.id.slice(0, 8)}
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
            Received Date <span className="text-red-500">*</span>
          </label>
          <Input
            name="receivedDate"
            type="date"
            defaultValue={defaultValues?.receivedDate?.split('T')[0]}
            required
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
                  onChange={(e) => handleItemChange(index, e.target.value)}
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
                <label className="block text-xs font-medium text-slate-500 mb-1">Received Qty</label>
                <Input
                  type="number"
                  value={item.receivedQty || ''}
                  onChange={(e) => updateItem(index, 'receivedQty', Number(e.target.value))}
                  min="0"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Accepted Qty</label>
                <Input
                  type="number"
                  value={item.acceptedQty || ''}
                  onChange={(e) => updateItem(index, 'acceptedQty', Number(e.target.value))}
                  min="0"
                  className="text-sm"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Rejected Qty</label>
                  <Input
                    type="number"
                    value={item.rejectedQty || ''}
                    onChange={(e) => updateItem(index, 'rejectedQty', Number(e.target.value))}
                    min="0"
                    className="text-sm"
                  />
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

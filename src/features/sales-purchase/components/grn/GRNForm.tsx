import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { GRNFormData, GRNItemFormData } from '../../types/sales-purchase.types';
import { getPurchaseOrders, getPurchaseOrder, getWarehouses } from '../../api/sales-purchase.api';
import type { PurchaseOrder, Warehouse } from '../../types/sales-purchase.types';

interface GRNFormProps {
  defaultValues?: GRNFormData;
  onSubmit?: (data: GRNFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

const emptyLine: GRNItemFormData = { po_item_id: 0, received_qty: 0, accepted_qty: 0, rejected_qty: 0 };

export default function GRNForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: GRNFormProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<GRNItemFormData[]>(
    defaultValues?.items && defaultValues.items.length > 0 ? defaultValues.items : [{ ...emptyLine }]
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedPOId, setSelectedPOId] = useState<string>(defaultValues?.purchase_order_id ? String(defaultValues.purchase_order_id) : '');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPOItems, setLoadingPOItems] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedPOId) {
      setSelectedPO(null);
      return;
    }
    let cancelled = false;
    setLoadingPOItems(true);
    getPurchaseOrder(selectedPOId)
      .then((po) => {
        if (!cancelled) setSelectedPO(po);
      })
      .catch((error) => {
        console.error('Failed to load purchase order items:', error);
        if (!cancelled) setSelectedPO(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingPOItems(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPOId]);

  async function loadData() {
    try {
      setLoading(true);
      const [purchaseOrdersData, warehousesData] = await Promise.all([
        getPurchaseOrders(),
        getWarehouses(),
      ]);
      setPurchaseOrders(purchaseOrdersData);
      setWarehouses(warehousesData);
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

  const updateItem = (index: number, field: keyof GRNItemFormData, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const data: GRNFormData = {
      purchase_order_id: Number(formData.get('purchase_order_id')),
      received_date: formData.get('received_date') as string,
      warehouse_id: Number(formData.get('warehouse_id')),
      items: items.filter((item) => item.po_item_id && item.received_qty > 0),
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
                Purchase Order <span className="text-red-500">*</span>
              </label>
              <select
                name="purchase_order_id"
                defaultValue={defaultValues?.purchase_order_id ? String(defaultValues.purchase_order_id) : ''}
                onChange={(e) => {
                  setSelectedPOId(e.target.value);
                  setItems([{ ...emptyLine }]);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select purchase order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.po_id} value={po.po_id}>
                    {po.po_number}
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
                Received Date <span className="text-red-500">*</span>
              </label>
              <Input
                name="received_date"
                type="date"
                defaultValue={defaultValues?.received_date?.split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Items</h3>
              <Button variant="secondary" size="sm" type="button" onClick={addItem} disabled={!selectedPOId}>
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Item</label>
                    <select
                      value={item.po_item_id || ''}
                      onChange={(e) => updateItem(index, 'po_item_id', Number(e.target.value))}
                      disabled={!selectedPOId || loadingPOItems}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    >
                      <option value="">
                        {!selectedPOId
                          ? 'Select a purchase order first'
                          : loadingPOItems
                            ? 'Loading items...'
                            : 'Select item'}
                      </option>
                      {selectedPO?.items?.map((poItem) => (
                        <option key={poItem.po_item_id} value={poItem.po_item_id}>
                          {poItem.item?.item_name || poItem.item_id} (ordered: {poItem.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Received Qty</label>
                    <Input
                      type="number"
                      value={item.received_qty || ''}
                      onChange={(e) => updateItem(index, 'received_qty', Number(e.target.value))}
                      min="0"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Accepted Qty</label>
                    <Input
                      type="number"
                      value={item.accepted_qty || ''}
                      onChange={(e) => updateItem(index, 'accepted_qty', Number(e.target.value))}
                      min="0"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Rejected Qty</label>
                      <Input
                        type="number"
                        value={item.rejected_qty || ''}
                        onChange={(e) => updateItem(index, 'rejected_qty', Number(e.target.value))}
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
            <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={() => navigate('/sales-purchase/grn')}>
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

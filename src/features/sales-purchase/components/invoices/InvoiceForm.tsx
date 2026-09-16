import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { InvoiceFormData, InvoiceItemFormData } from '../../types/sales-purchase.types';
import { getVendors, getItems, getTaxCodes, getPurchaseOrders, getPurchaseOrder, getGRNs, getGRN } from '../../api/sales-purchase.api';
import type { Vendor, Item, TaxCode, PurchaseOrder, GRN } from '../../types/sales-purchase.types';

interface InvoiceFormProps {
  defaultValues?: InvoiceFormData;
  onSubmit?: (data: InvoiceFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

const emptyLine: InvoiceItemFormData = { item_id: 0, quantity: 0, unit_price: 0, tax_code_id: 0, line_discount: 0 };

export default function InvoiceForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: InvoiceFormProps) {
  const [items, setItems] = useState<InvoiceItemFormData[]>(
    defaultValues?.items && defaultValues.items.length > 0 ? defaultValues.items : [{ ...emptyLine }]
  );
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGRNs] = useState<GRN[]>([]);
  const [selectedPOId, setSelectedPOId] = useState<string>(defaultValues?.purchase_order_id ? String(defaultValues.purchase_order_id) : '');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedGRNId, setSelectedGRNId] = useState<string>(defaultValues?.grn_id ? String(defaultValues.grn_id) : '');
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedPOId) {
      setSelectedPO(null);
      return;
    }
    getPurchaseOrder(selectedPOId)
      .then(setSelectedPO)
      .catch((error) => {
        console.error('Failed to load purchase order items:', error);
        setSelectedPO(null);
      });
  }, [selectedPOId]);

  useEffect(() => {
    if (!selectedGRNId) {
      setSelectedGRN(null);
      return;
    }
    getGRN(selectedGRNId)
      .then(setSelectedGRN)
      .catch((error) => {
        console.error('Failed to load GRN items:', error);
        setSelectedGRN(null);
      });
  }, [selectedGRNId]);

  async function loadData() {
    try {
      setLoading(true);
      const [vendorsData, itemsData, taxCodesData, purchaseOrdersData, grnsData] = await Promise.all([
        getVendors(),
        getItems(),
        getTaxCodes(),
        getPurchaseOrders(),
        getGRNs(),
      ]);
      setVendors(vendorsData);
      setItemsList(itemsData);
      setTaxCodes(taxCodesData);
      setPurchaseOrders(purchaseOrdersData);
      setGRNs(grnsData);
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

  const updateItem = (index: number, field: keyof InvoiceItemFormData, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const applyPOItem = (index: number, poItemId: number) => {
    const poItem = selectedPO?.items?.find((i) => i.po_item_id === poItemId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      po_item_id: poItemId || undefined,
      item_id: poItem?.item_id || newItems[index].item_id,
      unit_price: poItem ? Number(poItem.unit_price) : newItems[index].unit_price,
      tax_code_id: poItem?.tax_code_id || newItems[index].tax_code_id,
    };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const data: InvoiceFormData = {
      vendor_invoice_number: formData.get('vendor_invoice_number') as string,
      vendor_id: Number(formData.get('vendor_id')),
      invoice_date: formData.get('invoice_date') as string,
      discount: formData.get('discount') ? Number(formData.get('discount')) : 0,
      items: items.filter((item) => item.item_id && item.quantity > 0),
    };

    if (selectedPOId) data.purchase_order_id = Number(selectedPOId);
    if (selectedGRNId) data.grn_id = Number(selectedGRNId);

    const dueDate = formData.get('due_date') as string;
    if (dueDate) data.due_date = dueDate;

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
                Vendor Invoice Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="vendor_invoice_number"
                type="text"
                defaultValue={defaultValues?.vendor_invoice_number}
                placeholder="e.g., VEND-INV-98123"
                required
              />
            </div>
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
                Purchase Order
              </label>
              <select
                value={selectedPOId}
                onChange={(e) => setSelectedPOId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                GRN
              </label>
              <select
                value={selectedGRNId}
                onChange={(e) => setSelectedGRNId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select GRN</option>
                {grns.map((grn) => (
                  <option key={grn.grn_id} value={grn.grn_id}>
                    {grn.grn_number}
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
                <div key={index} className="p-3 bg-slate-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Link PO Line</label>
                      <select
                        value={item.po_item_id || ''}
                        onChange={(e) => applyPOItem(index, Number(e.target.value))}
                        disabled={!selectedPO}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">{selectedPO ? 'None' : 'Select a PO above first'}</option>
                        {selectedPO?.items?.map((poItem) => (
                          <option key={poItem.po_item_id} value={poItem.po_item_id}>
                            {poItem.item?.item_name || poItem.item_id} (qty {poItem.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Link GRN Line</label>
                      <select
                        value={item.grn_item_id || ''}
                        onChange={(e) => updateItem(index, 'grn_item_id', Number(e.target.value))}
                        disabled={!selectedGRN}
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">{selectedGRN ? 'None' : 'Select a GRN above first'}</option>
                        {selectedGRN?.items?.map((grnItem) => (
                          <option key={grnItem.grn_item_id} value={grnItem.grn_item_id}>
                            {grnItem.item?.item_name || grnItem.item_id} (received {grnItem.received_qty})
                          </option>
                        ))}
                      </select>
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

import { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { InvoiceFormData, InvoiceItem } from '../../types/sales-purchase.types';
import { getVendors, getItems, getTaxCodes, getPurchaseOrders, getGRNs } from '../../api/sales-purchase.api';
import type { Vendor, Item, TaxCode, PurchaseOrder, GRN } from '../../types/sales-purchase.types';

interface InvoiceFormProps {
  defaultValues?: InvoiceFormData;
  onSubmit?: (data: InvoiceFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function InvoiceForm({
  defaultValues,
  onSubmit,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: InvoiceFormProps) {
  const [items, setItems] = useState<InvoiceItem[]>(
    defaultValues?.items || [{ itemId: '', quantity: 0, unitPrice: 0, taxCodeId: '' }]
  );
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGRNs] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
    setItems([...items, { itemId: '', quantity: 0, unitPrice: 0, taxCodeId: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: InvoiceItem, i: number) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const data: InvoiceFormData = {
      vendorInvoiceNumber: formData.get('vendorInvoiceNumber') as string,
      vendorId: formData.get('vendorId') as string,
      poId: formData.get('poId') as string,
      grnId: formData.get('grnId') as string,
      invoiceDate: formData.get('invoiceDate') as string,
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
                Invoice Type <span className="text-red-500">*</span>
              </label>
              <select
                name="invoiceType"
                defaultValue="PURCHASE"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="PURCHASE">Purchase Invoice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vendor Invoice Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="vendorInvoiceNumber"
                type="text"
                defaultValue={defaultValues?.vendorInvoiceNumber}
                required
              />
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
                Purchase Order
              </label>
              <select
                name="poId"
                defaultValue={defaultValues?.poId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                GRN
              </label>
              <select
                name="grnId"
                defaultValue={defaultValues?.grnId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select GRN</option>
                {grns.map((grn) => (
                  <option key={grn.id} value={grn.id}>
                    GRN-{grn.id.slice(0, 8)}
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
                defaultValue={defaultValues?.invoiceDate?.split('T')[0]}
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import { cardClass, inputClass } from '../../../../components/premium/styles';
import LineItemsEditor from '../lines/LineItemsEditor';
import { getItems, getTaxCodes, getVendors, getWarehouses } from '../../api/sales-purchase.api';
import type { PurchaseOrderFormData, PurchaseOrderItemFormData } from '../../types/sales-purchase.types';
import { emptyLine } from '../../utils/lines';

interface PurchaseOrderFormProps {
  defaultValues?: PurchaseOrderFormData;
  onSubmit?: (data: PurchaseOrderFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

const todayIso = () => new Date().toISOString().split('T')[0];

// Purchase order form: details, items, total. Price and tax fill in from the item.
export default function PurchaseOrderForm({ defaultValues, onSubmit, submitText = 'Save', isSubmitting = false, className }: PurchaseOrderFormProps) {
  const vendorsQuery = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });
  const warehousesQuery = useQuery({ queryKey: ['sales-purchase', 'warehouses'], queryFn: getWarehouses });
  const itemsQuery = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const taxQuery = useQuery({ queryKey: ['sales-purchase', 'tax-codes'], queryFn: getTaxCodes });

  const [vendorId, setVendorId] = useState(defaultValues?.vendor_id ?? 0);
  // 0 = not chosen yet; falls back to the default warehouse.
  const [warehouseChoice, setWarehouseChoice] = useState(defaultValues?.warehouse_id ?? 0);
  const [poDate, setPoDate] = useState(defaultValues?.po_date?.split('T')[0] ?? todayIso());
  const [deliveryDate, setDeliveryDate] = useState(defaultValues?.expected_delivery_date?.split('T')[0] ?? '');
  const [discount, setDiscount] = useState(defaultValues?.discount ?? 0);
  const [lines, setLines] = useState<PurchaseOrderItemFormData[]>(defaultValues?.items?.length ? defaultValues.items : [{ ...emptyLine }]);
  const [showErrors, setShowErrors] = useState(false);

  if (vendorsQuery.isLoading || warehousesQuery.isLoading || itemsQuery.isLoading || taxQuery.isLoading) return <FormLoading />;
  if (vendorsQuery.isError || warehousesQuery.isError || itemsQuery.isError || taxQuery.isError) {
    return <div className={`${cardClass} text-center text-sm text-red-600`}>We couldn't load vendors, warehouses or items. Please try again.</div>;
  }

  const vendors = (vendorsQuery.data ?? []).filter((v) => v.status !== 'INACTIVE' || v.vendor_id === defaultValues?.vendor_id);
  const warehouses = warehousesQuery.data ?? [];
  const warehouseId = warehouseChoice || warehouses.find((w) => w.is_default)?.warehouse_id || 0;
  const filledLines = lines.filter((line) => line.item_id && line.quantity > 0);

  const errors = {
    vendor: vendorId ? undefined : 'Choose a vendor',
    warehouse: warehouseId ? undefined : 'Choose a warehouse',
    poDate: poDate ? undefined : 'Pick a date',
    delivery: deliveryDate && deliveryDate < poDate ? 'Can’t be before the order date' : undefined,
    lines: filledLines.length ? undefined : 'Add at least one item with a quantity',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (message?: string) => (showErrors ? message : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({ vendor_id: vendorId, po_date: poDate, expected_delivery_date: deliveryDate, warehouse_id: warehouseId, discount, items: filledLines });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-5 ${className ?? ''}`}>
      <FormCard title="Order details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Vendor" error={show(errors.vendor)}>
            <select value={vendorId || ''} onChange={(e) => setVendorId(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a vendor</option>
              {vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deliver to" error={show(errors.warehouse)}>
            <select value={warehouseId || ''} onChange={(e) => setWarehouseChoice(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a warehouse</option>
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order date" error={show(errors.poDate)}>
            <input type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Needed by (optional)" error={errors.delivery}>
            <input type="date" value={deliveryDate} min={poDate} onChange={(e) => setDeliveryDate(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {!vendorId && (
          <p className="mt-3 text-xs text-slate-500">
            Vendor missing?{' '}
            <Link to="/sales-purchase/vendors/new" className="font-medium text-brand hover:text-brand-navy">
              Add a vendor
            </Link>
          </p>
        )}
      </FormCard>

      <FormCard title="Items">
        <LineItemsEditor
          lines={lines}
          onChange={setLines}
          newLine={() => ({ ...emptyLine })}
          catalog={itemsQuery.data ?? []}
          taxCodes={taxQuery.data ?? []}
          priceField="purchase_price"
          discount={discount}
          onDiscount={setDiscount}
          error={show(errors.lines)}
        />
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

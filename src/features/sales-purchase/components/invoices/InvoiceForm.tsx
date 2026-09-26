import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link2, Wand2 } from 'lucide-react';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { toNumber } from '../../../../utils/dashboardFormat';
import LineItemsEditor from '../lines/LineItemsEditor';
import { getGRN, getGRNs, getItems, getPaymentTerms, getPurchaseOrder, getPurchaseOrders, getTaxCodes, getVendors } from '../../api/sales-purchase.api';
import type { InvoiceFormData, InvoiceItemFormData } from '../../types/sales-purchase.types';
import { emptyLine } from '../../utils/lines';

interface InvoiceFormProps {
  defaultValues?: InvoiceFormData;
  onSubmit?: (data: InvoiceFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

const INVOICEABLE = ['APPROVED', 'PARTIALLY_RECEIVED', 'CLOSED'];
const todayIso = () => new Date().toISOString().split('T')[0];

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// A vendor's bill: who, their invoice number, optional order/receipt match, and the lines.
export default function InvoiceForm({ defaultValues, onSubmit, submitText = 'Save', isSubmitting = false }: InvoiceFormProps) {
  const vendorsQ = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });
  const termsQ = useQuery({ queryKey: ['sales-purchase', 'payment-terms'], queryFn: getPaymentTerms });
  const ordersQ = useQuery({ queryKey: ['sales-purchase', 'purchase-orders'], queryFn: getPurchaseOrders });
  const grnsQ = useQuery({ queryKey: ['sales-purchase', 'grns'], queryFn: getGRNs });
  const itemsQ = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const taxQ = useQuery({ queryKey: ['sales-purchase', 'tax-codes'], queryFn: getTaxCodes });

  const [vendorId, setVendorId] = useState(defaultValues?.vendor_id ?? 0);
  const [vendorNo, setVendorNo] = useState(defaultValues?.vendor_invoice_number ?? '');
  const [invoiceDate, setInvoiceDate] = useState(defaultValues?.invoice_date?.split('T')[0] ?? todayIso());
  const [dueDate, setDueDate] = useState(defaultValues?.due_date?.split('T')[0] ?? '');
  const [dueTouched, setDueTouched] = useState(Boolean(defaultValues?.due_date));
  const [poId, setPoId] = useState(defaultValues?.purchase_order_id ?? 0);
  const [grnId, setGrnId] = useState(defaultValues?.grn_id ?? 0);
  const [discount, setDiscount] = useState(defaultValues?.discount ?? 0);
  const [lines, setLines] = useState<InvoiceItemFormData[]>(defaultValues?.items?.length ? defaultValues.items : [{ ...emptyLine }]);
  const [showErrors, setShowErrors] = useState(false);
  const [filling, setFilling] = useState(false);

  if ([vendorsQ, termsQ, ordersQ, grnsQ, itemsQ, taxQ].some((q) => q.isLoading)) return <FormLoading blocks={3} />;

  const vendors = (vendorsQ.data ?? []).filter((v) => v.status !== 'INACTIVE' || v.vendor_id === vendorId);
  const vendor = vendors.find((v) => v.vendor_id === vendorId);
  const termDays = vendor?.payment_term_id ? termsQ.data?.find((t) => t.payment_term_id === vendor.payment_term_id)?.days : undefined;
  const effectiveDue = dueTouched ? dueDate : termDays !== undefined && invoiceDate ? addDays(invoiceDate, termDays) : dueDate;

  const orders = (ordersQ.data ?? []).filter((o) => o.vendor_id === vendorId && (INVOICEABLE.includes(o.status) || o.po_id === poId)).sort((a, b) => b.po_id - a.po_id);
  const receipts = (grnsQ.data ?? []).filter((g) => g.purchase_order_id === poId && (g.status === 'POSTED' || g.grn_id === grnId));
  const grnNumber = new Map((grnsQ.data ?? []).map((g) => [g.grn_id, g.grn_number]));

  // Fill lines from the chosen receipt (accepted quantities) or, without one, from the order.
  const fillLines = async () => {
    if (!poId) return;
    setFilling(true);
    try {
      const po = await getPurchaseOrder(poId);
      const poLines = new Map((po.items ?? []).map((l) => [l.po_item_id, l]));
      if (grnId) {
        const grn = await getGRN(grnId);
        setLines(
          (grn.items ?? [])
            .filter((g) => toNumber(g.accepted_qty) > 0)
            .map((g) => {
              const pl = poLines.get(g.po_item_id);
              return { item_id: g.item_id, po_item_id: g.po_item_id, grn_item_id: g.grn_item_id, quantity: toNumber(g.accepted_qty), unit_price: toNumber(pl?.unit_price), tax_code_id: pl?.tax_code_id ?? 0, line_discount: 0 };
            }),
        );
      } else {
        setLines((po.items ?? []).map((l) => ({ item_id: l.item_id, po_item_id: l.po_item_id, quantity: toNumber(l.quantity), unit_price: toNumber(l.unit_price), tax_code_id: l.tax_code_id, line_discount: toNumber(l.line_discount) })));
      }
    } finally {
      setFilling(false);
    }
  };

  const filled = lines.filter((l) => l.item_id && l.quantity > 0);
  const errors = {
    vendor: vendorId ? undefined : 'Choose the vendor',
    vendorNo: vendorNo.trim() ? undefined : "Enter the number printed on the vendor's invoice",
    date: invoiceDate ? undefined : 'Pick the invoice date',
    due: effectiveDue && effectiveDue < invoiceDate ? 'Can’t be before the invoice date' : undefined,
    lines: filled.length ? undefined : 'Add at least one item with a quantity',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (m?: string) => (showErrors ? m : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({
      vendor_invoice_number: vendorNo.trim(),
      vendor_id: vendorId,
      invoice_date: invoiceDate,
      discount,
      items: filled,
      ...(poId ? { purchase_order_id: poId } : {}),
      ...(grnId ? { grn_id: grnId } : {}),
      ...(effectiveDue ? { due_date: effectiveDue } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Invoice details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Vendor" error={show(errors.vendor)}>
            <select
              value={vendorId || ''}
              onChange={(e) => {
                setVendorId(Number(e.target.value));
                setPoId(0);
                setGrnId(0);
              }}
              className={inputClass}
            >
              <option value="">Choose a vendor</option>
              {vendors.map((v) => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vendor's invoice no." error={show(errors.vendorNo)}>
            <input value={vendorNo} onChange={(e) => setVendorNo(e.target.value)} placeholder="As printed on their bill" className={inputClass} />
          </Field>
          <Field label="Invoice date" error={show(errors.date)}>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Pay by" hint={!dueTouched && termDays !== undefined ? `From their payment term (${termDays} days).` : undefined} error={errors.due}>
            <input
              type="date"
              value={effectiveDue}
              min={invoiceDate}
              onChange={(e) => {
                setDueTouched(true);
                setDueDate(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
        </div>
      </FormCard>

      <FormCard title="Match with an order (optional)" description="Linking the order and goods receipt lets the bill be checked against what was ordered and received.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Purchase order">
            <select
              value={poId || ''}
              onChange={(e) => {
                setPoId(Number(e.target.value));
                setGrnId(0);
              }}
              disabled={!vendorId}
              className={inputClass}
            >
              <option value="">{vendorId ? (orders.length ? 'None' : 'No orders to invoice') : 'Choose the vendor first'}</option>
              {orders.map((o) => (
                <option key={o.po_id} value={o.po_id}>
                  {o.po_number}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Goods receipt">
            <select value={grnId || ''} onChange={(e) => setGrnId(Number(e.target.value))} disabled={!poId} className={inputClass}>
              <option value="">{poId ? (receipts.length ? 'None' : 'No posted receipts') : 'Choose the order first'}</option>
              {receipts.map((g) => (
                <option key={g.grn_id} value={g.grn_id}>
                  {g.grn_number}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fillLines}
              disabled={!poId || filling}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4 text-brand" /> {filling ? 'Filling…' : grnId ? 'Fill items from receipt' : 'Fill items from order'}
            </button>
          </div>
        </div>
      </FormCard>

      <FormCard title="Items">
        <LineItemsEditor<InvoiceItemFormData>
          lines={lines}
          onChange={setLines}
          newLine={() => ({ ...emptyLine })}
          catalog={itemsQ.data ?? []}
          taxCodes={taxQ.data ?? []}
          priceField="purchase_price"
          discount={discount}
          onDiscount={setDiscount}
          error={show(errors.lines)}
          lineTag={(l) =>
            l.grn_item_id || l.po_item_id ? (
              <span className="inline-flex items-center gap-1">
                <Link2 className="h-3 w-3" /> {grnId && l.grn_item_id ? `from ${grnNumber.get(grnId) ?? 'receipt'}` : 'from the purchase order'}
              </span>
            ) : null
          }
        />
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

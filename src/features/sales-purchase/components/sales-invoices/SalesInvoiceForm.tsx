import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link2 } from 'lucide-react';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { toNumber } from '../../../../utils/dashboardFormat';
import LineItemsEditor from '../lines/LineItemsEditor';
import { getCustomers, getItems, getPaymentTerms, getSalesOrder, getSalesOrders, getTaxCodes } from '../../api/sales-purchase.api';
import type { SalesInvoiceFormData, SalesInvoiceItemFormData, SalesOrder } from '../../types/sales-purchase.types';
import { emptyLine } from '../../utils/lines';

interface SalesInvoiceFormProps {
  defaultValues?: SalesInvoiceFormData;
  // Start from this sales order (from the order's "Create invoice").
  initialSoId?: number;
  onSubmit?: (data: SalesInvoiceFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

const INVOICEABLE = ['CONFIRMED', 'PARTIALLY_INVOICED'];
const todayIso = () => new Date().toISOString().split('T')[0];

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Lines for what's still to invoice on an order.
function linesFromOrder(so: SalesOrder): SalesInvoiceItemFormData[] {
  return (so.items ?? [])
    .map((l) => ({
      item_id: l.item_id,
      so_item_id: l.so_item_id,
      quantity: Math.max(0, toNumber(l.quantity) - toNumber(l.invoiced_qty)),
      unit_price: toNumber(l.unit_price),
      tax_code_id: l.tax_code_id,
      line_discount: toNumber(l.line_discount),
    }))
    .filter((l) => l.quantity > 0);
}

export default function SalesInvoiceForm({ defaultValues, initialSoId, onSubmit, submitText = 'Save', isSubmitting = false }: SalesInvoiceFormProps) {
  const customersQ = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });
  const termsQ = useQuery({ queryKey: ['sales-purchase', 'payment-terms'], queryFn: getPaymentTerms });
  const ordersQ = useQuery({ queryKey: ['sales-purchase', 'sales-orders'], queryFn: getSalesOrders });
  const itemsQ = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const taxQ = useQuery({ queryKey: ['sales-purchase', 'tax-codes'], queryFn: getTaxCodes });

  const [customerChoice, setCustomerChoice] = useState(defaultValues?.customer_id ?? 0);
  const [soId, setSoId] = useState(defaultValues?.sales_order_id ?? initialSoId ?? 0);
  const soQ = useQuery({ queryKey: ['sales-purchase', 'sales-order', String(soId)], queryFn: () => getSalesOrder(soId), enabled: soId > 0 });
  const [invoiceDate, setInvoiceDate] = useState(defaultValues?.invoice_date?.split('T')[0] ?? todayIso());
  const [dueDate, setDueDate] = useState(defaultValues?.due_date?.split('T')[0] ?? '');
  const [dueTouched, setDueTouched] = useState(Boolean(defaultValues?.due_date));
  const [discount, setDiscount] = useState(defaultValues?.discount ?? 0);
  // null = follow the chosen order's remaining lines until someone edits them.
  const [editedLines, setEditedLines] = useState<SalesInvoiceItemFormData[] | null>(defaultValues?.items?.length ? defaultValues.items : null);
  const [showErrors, setShowErrors] = useState(false);

  if ([customersQ, termsQ, ordersQ, itemsQ, taxQ].some((q) => q.isLoading)) return <FormLoading blocks={3} />;

  const customerId = customerChoice || (ordersQ.data ?? []).find((o) => o.so_id === soId)?.customer_id || 0;
  const customers = (customersQ.data ?? []).filter((c) => c.status !== 'INACTIVE' || c.customer_id === customerId);
  const customer = customers.find((c) => c.customer_id === customerId);
  const termDays = customer?.payment_term_id ? termsQ.data?.find((t) => t.payment_term_id === customer.payment_term_id)?.days : undefined;
  const effectiveDue = dueTouched ? dueDate : termDays !== undefined && invoiceDate ? addDays(invoiceDate, termDays) : dueDate;
  const orders = (ordersQ.data ?? []).filter((o) => o.customer_id === customerId && (INVOICEABLE.includes(o.status) || o.so_id === soId)).sort((a, b) => b.so_id - a.so_id);

  const lines = editedLines ?? (soId && soQ.data ? linesFromOrder(soQ.data) : [{ ...emptyLine }]);
  const filled = lines.filter((l) => l.item_id && l.quantity > 0);
  const errors = {
    customer: customerId ? undefined : 'Choose the customer',
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
    onSubmit?.({ customer_id: customerId, invoice_date: invoiceDate, discount, items: filled, ...(soId ? { sales_order_id: soId } : {}), ...(effectiveDue ? { due_date: effectiveDue } : {}) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Invoice details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Customer" error={show(errors.customer)}>
            <select
              value={customerId || ''}
              onChange={(e) => {
                setCustomerChoice(Number(e.target.value));
                setSoId(0);
                setEditedLines(null);
              }}
              className={inputClass}
            >
              <option value="">Choose a customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sales order (optional)" hint={soId ? 'Items fill in with what is still to invoice.' : undefined}>
            <select
              value={soId || ''}
              onChange={(e) => {
                setSoId(Number(e.target.value));
                setEditedLines(null);
              }}
              disabled={!customerId}
              className={inputClass}
            >
              <option value="">{customerId ? (orders.length ? 'None' : 'No orders to invoice') : 'Choose the customer first'}</option>
              {orders.map((o) => (
                <option key={o.so_id} value={o.so_id}>
                  {o.so_number}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Invoice date" error={show(errors.date)}>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Due by" hint={!dueTouched && termDays !== undefined ? `From their payment term (${termDays} days).` : undefined} error={errors.due}>
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

      <FormCard title="Items">
        {soId > 0 && soQ.isLoading ? (
          <div className="space-y-2">
            <div className="skeleton h-10 rounded-xl" />
            <div className="skeleton h-10 rounded-xl" />
          </div>
        ) : (
          <LineItemsEditor<SalesInvoiceItemFormData>
            lines={lines}
            onChange={setEditedLines}
            newLine={() => ({ ...emptyLine })}
            catalog={itemsQ.data ?? []}
            taxCodes={taxQ.data ?? []}
            priceField="sales_price"
            discount={discount}
            onDiscount={setDiscount}
            error={show(errors.lines)}
            lineTag={(l) =>
              l.so_item_id ? (
                <span className="inline-flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> from {soQ.data?.so_number ?? 'the sales order'}
                </span>
              ) : null
            }
          />
        )}
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

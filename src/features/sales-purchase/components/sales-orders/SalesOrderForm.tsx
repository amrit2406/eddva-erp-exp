import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import { cardClass, inputClass } from '../../../../components/premium/styles';
import LineItemsEditor from '../lines/LineItemsEditor';
import { getCustomers, getItems, getTaxCodes } from '../../api/sales-purchase.api';
import type { SalesOrderFormData, SalesOrderItemFormData } from '../../types/sales-purchase.types';
import { emptyLine } from '../../utils/lines';

interface SalesOrderFormProps {
  defaultValues?: SalesOrderFormData;
  onSubmit?: (data: SalesOrderFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

const todayIso = () => new Date().toISOString().split('T')[0];

// Customer, dates and items — selling price and tax fill in from each item.
export default function SalesOrderForm({ defaultValues, onSubmit, submitText = 'Save', isSubmitting = false }: SalesOrderFormProps) {
  const customersQ = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });
  const itemsQ = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const taxQ = useQuery({ queryKey: ['sales-purchase', 'tax-codes'], queryFn: getTaxCodes });

  const [customerId, setCustomerId] = useState(defaultValues?.customer_id ?? 0);
  const [soDate, setSoDate] = useState(defaultValues?.so_date?.split('T')[0] ?? todayIso());
  const [deliveryDate, setDeliveryDate] = useState(defaultValues?.delivery_date?.split('T')[0] ?? '');
  const [discount, setDiscount] = useState(defaultValues?.discount ?? 0);
  const [lines, setLines] = useState<SalesOrderItemFormData[]>(defaultValues?.items?.length ? defaultValues.items : [{ ...emptyLine }]);
  const [showErrors, setShowErrors] = useState(false);

  if (customersQ.isLoading || itemsQ.isLoading || taxQ.isLoading) return <FormLoading />;
  if (customersQ.isError || itemsQ.isError || taxQ.isError) {
    return <div className={`${cardClass} text-center text-sm text-red-600`}>We couldn't load customers or items. Please try again.</div>;
  }

  const customers = (customersQ.data ?? []).filter((c) => c.status !== 'INACTIVE' || c.customer_id === defaultValues?.customer_id);
  const filled = lines.filter((l) => l.item_id && l.quantity > 0);
  const errors = {
    customer: customerId ? undefined : 'Choose a customer',
    date: soDate ? undefined : 'Pick a date',
    delivery: deliveryDate && deliveryDate < soDate ? 'Can’t be before the order date' : undefined,
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
    onSubmit?.({ customer_id: customerId, so_date: soDate, discount, items: filled, ...(deliveryDate ? { delivery_date: deliveryDate } : {}) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Order details">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Customer" error={show(errors.customer)}>
            <select value={customerId || ''} onChange={(e) => setCustomerId(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order date" error={show(errors.date)}>
            <input type="date" value={soDate} onChange={(e) => setSoDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Deliver by (optional)" error={errors.delivery}>
            <input type="date" value={deliveryDate} min={soDate} onChange={(e) => setDeliveryDate(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {!customerId && (
          <p className="mt-3 text-xs text-slate-500">
            Customer missing?{' '}
            <Link to="/sales-purchase/customers/new" className="font-medium text-brand hover:text-brand-navy">
              Add a customer
            </Link>
          </p>
        )}
      </FormCard>

      <FormCard title="Items">
        <LineItemsEditor<SalesOrderItemFormData>
          lines={lines}
          onChange={setLines}
          newLine={() => ({ ...emptyLine })}
          catalog={itemsQ.data ?? []}
          taxCodes={taxQ.data ?? []}
          priceField="sales_price"
          discount={discount}
          onDiscount={setDiscount}
          error={show(errors.lines)}
        />
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

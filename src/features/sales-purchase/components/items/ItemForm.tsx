import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { rupees } from '../../../../utils/dashboardFormat';
import { getItemCategories, getItems, getTaxCodes, getUOMs } from '../../api/sales-purchase.api';
import type { ItemFormData } from '../../types/sales-purchase.types';
import { formatRate, totalRate } from '../../utils/taxCode';

interface ItemFormProps {
  defaultValues?: ItemFormData;
  itemId?: number;
  onSubmit?: (data: ItemFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

const num = (v: string) => (v === '' ? NaN : Number(v));

// Item details in two cards; dropdowns only offer active categories, units and tax codes.
export default function ItemForm({ defaultValues, itemId, onSubmit, submitText = 'Save', isSubmitting = false }: ItemFormProps) {
  const categoriesQ = useQuery({ queryKey: ['sales-purchase', 'item-categories'], queryFn: getItemCategories });
  const uomsQ = useQuery({ queryKey: ['sales-purchase', 'uoms'], queryFn: getUOMs });
  const taxQ = useQuery({ queryKey: ['sales-purchase', 'tax-codes'], queryFn: getTaxCodes });
  const itemsQ = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });

  const [name, setName] = useState(defaultValues?.item_name ?? '');
  const [categoryId, setCategoryId] = useState(defaultValues?.category_id ?? 0);
  const [uomId, setUomId] = useState(defaultValues?.uom_id ?? 0);
  const [hsn, setHsn] = useState(defaultValues?.hsn_sac_code ?? '');
  const [buy, setBuy] = useState(defaultValues ? String(defaultValues.purchase_price) : '');
  const [sell, setSell] = useState(defaultValues ? String(defaultValues.sales_price) : '');
  const [taxId, setTaxId] = useState(defaultValues?.tax_code_id ?? 0);
  const [showErrors, setShowErrors] = useState(false);

  if (categoriesQ.isLoading || uomsQ.isLoading || taxQ.isLoading) return <FormLoading />;

  // Keep the item's current choice visible even if it has since been turned off.
  const categories = (categoriesQ.data ?? []).filter((c) => c.status !== 'INACTIVE' || c.category_id === defaultValues?.category_id);
  const uoms = (uomsQ.data ?? []).filter((u) => u.status !== 'INACTIVE' || u.uom_id === defaultValues?.uom_id);
  const taxes = (taxQ.data ?? []).filter((t) => t.is_active || t.tax_code_id === defaultValues?.tax_code_id);

  const buyPrice = num(buy);
  const sellPrice = num(sell);
  const margin = Number.isFinite(buyPrice) && Number.isFinite(sellPrice) ? sellPrice - buyPrice : NaN;
  const duplicate = (itemsQ.data ?? []).find((i) => i.item_id !== itemId && i.item_name.trim().toLowerCase() === name.trim().toLowerCase());

  const errors = {
    name: !name.trim() ? 'Enter the item name' : duplicate ? `“${duplicate.item_name}” already exists (${duplicate.item_code})` : undefined,
    category: categoryId ? undefined : 'Choose a category',
    uom: uomId ? undefined : 'Choose how it is counted',
    buy: Number.isFinite(buyPrice) && buyPrice >= 0 ? undefined : 'Enter the buying price',
    sell: Number.isFinite(sellPrice) && sellPrice >= 0 ? undefined : 'Enter the selling price',
    tax: taxId ? undefined : 'Choose a tax code',
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
      item_name: name.trim(),
      category_id: categoryId,
      uom_id: uomId,
      purchase_price: buyPrice,
      sales_price: sellPrice,
      tax_code_id: taxId,
      ...(hsn.trim() ? { hsn_sac_code: hsn.trim() } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="About the item">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name" className="sm:col-span-2" error={duplicate ? errors.name : show(errors.name)}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A4 Copier Paper (Ream)" autoFocus className={inputClass} />
          </Field>
          <Field label="Category" error={show(errors.category)}>
            <select value={categoryId || ''} onChange={(e) => setCategoryId(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Counted in" error={show(errors.uom)}>
            <select value={uomId || ''} onChange={(e) => setUomId(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a unit</option>
              {uoms.map((u) => (
                <option key={u.uom_id} value={u.uom_id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </Field>
          <Field label="HSN / SAC code (optional)" hint="The GST classification code, if you use one.">
            <input value={hsn} onChange={(e) => setHsn(e.target.value)} placeholder="e.g. 4802" className={`${inputClass} font-mono`} />
          </Field>
        </div>
        {(categories.length === 0 || uoms.length === 0) && (
          <p className="mt-3 text-xs text-slate-500">
            Missing something?{' '}
            <Link to="/sales-purchase/item-categories/new" className="font-medium text-brand">
              Add a category
            </Link>{' '}
            or{' '}
            <Link to="/sales-purchase/uom/new" className="font-medium text-brand">
              add a unit
            </Link>
            .
          </p>
        )}
      </FormCard>

      <FormCard title="Price & tax">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Buying price (₹)" hint="What you usually pay a vendor." error={show(errors.buy)}>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={buy} onChange={(e) => setBuy(e.target.value)} placeholder="0.00" className={inputClass} />
          </Field>
          <Field label="Selling price (₹)" hint="What you usually charge a customer." error={show(errors.sell)}>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={sell} onChange={(e) => setSell(e.target.value)} placeholder="0.00" className={inputClass} />
          </Field>
          <Field label="Tax code" error={show(errors.tax)}>
            <select value={taxId || ''} onChange={(e) => setTaxId(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a tax code</option>
              {taxes.map((t) => (
                <option key={t.tax_code_id} value={t.tax_code_id}>
                  {t.name} ({formatRate(totalRate(t))})
                </option>
              ))}
            </select>
          </Field>
        </div>
        {Number.isFinite(margin) && (
          <p className={`mt-4 flex items-center gap-2 text-sm ${margin < 0 ? 'text-amber-700' : 'text-slate-600'}`}>
            {margin < 0 && <AlertTriangle className="h-4 w-4" />}
            {margin < 0
              ? `Selling price is ${rupees(-margin)} below the buying price.`
              : `Margin ${rupees(margin)}${buyPrice > 0 ? ` (${Math.round((margin / buyPrice) * 100)}%)` : ''} per unit, before tax.`}
          </p>
        )}
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}

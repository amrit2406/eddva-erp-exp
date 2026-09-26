import type { ReactNode } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import IconAction from '../../../../components/premium/list/IconAction';
import { inputClass } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import type { Item, TaxCode } from '../../types/sales-purchase.types';
import { lineMath, linesTotals, type BaseLine } from '../../utils/lines';
import { formatRate, totalRate } from '../../utils/taxCode';

const GRID = 'md:grid-cols-[minmax(0,2.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_36px]';

interface LineItemsEditorProps<T extends BaseLine> {
  lines: T[];
  onChange: (lines: T[]) => void;
  newLine: () => T;
  catalog: Item[];
  taxCodes: TaxCode[];
  // Which catalogue price to fill in when an item is picked.
  priceField: 'purchase_price' | 'sales_price';
  discount: number;
  onDiscount: (value: number) => void;
  error?: string;
  // Small tag under a line, e.g. "from GRN/2026-27/00003".
  lineTag?: (line: T) => ReactNode;
}

// Compact item lines with live amounts and a totals block.
export default function LineItemsEditor<T extends BaseLine>({ lines, onChange, newLine, catalog, taxCodes, priceField, discount, onDiscount, error, lineTag }: LineItemsEditorProps<T>) {
  const itemById = new Map(catalog.map((i) => [i.item_id, i]));
  const taxById = new Map(taxCodes.map((t) => [t.tax_code_id, t]));
  const totals = linesTotals(lines, taxById, discount);

  const update = (index: number, patch: Partial<BaseLine>) => onChange(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const pick = (index: number, id: number) => {
    const item = itemById.get(id);
    update(index, { item_id: id, unit_price: item ? toNumber(item[priceField]) : 0, tax_code_id: item?.tax_code_id ?? 0 });
  };
  const activeCatalog = catalog.filter((i) => i.status !== 'INACTIVE' || lines.some((l) => l.item_id === i.item_id));

  return (
    <div>
      <div className={`hidden gap-2 px-1 pb-2 text-xs font-medium text-slate-500 md:grid ${GRID}`}>
        <span>Item</span>
        <span>Qty</span>
        <span>Price (₹)</span>
        <span>Discount (₹)</span>
        <span>Tax</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      <ul className="space-y-2">
        {lines.map((line, index) => {
          const m = lineMath(line, taxById.get(line.tax_code_id));
          const tag = lineTag?.(line);
          return (
            <li key={index} className={`grid grid-cols-2 items-center gap-2 rounded-2xl bg-slate-50/80 p-2 md:bg-transparent md:p-0 md:px-1 ${GRID}`}>
              <div className="col-span-2 md:col-span-1">
                <select value={line.item_id || ''} onChange={(e) => pick(index, Number(e.target.value))} aria-label={`Item ${index + 1}`} className={inputClass}>
                  <option value="">Choose an item</option>
                  {activeCatalog.map((o) => (
                    <option key={o.item_id} value={o.item_id}>
                      {o.item_name}
                    </option>
                  ))}
                </select>
                {tag && <div className="mt-1 text-[11px] text-slate-500">{tag}</div>}
              </div>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={line.quantity || ''}
                onChange={(e) => update(index, { quantity: Number(e.target.value) })}
                placeholder="Qty"
                aria-label="Quantity"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={line.unit_price || ''}
                onChange={(e) => update(index, { unit_price: Number(e.target.value) })}
                placeholder="Price"
                aria-label="Price each"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={line.line_discount || ''}
                onChange={(e) => update(index, { line_discount: Number(e.target.value) })}
                placeholder="0"
                aria-label="Discount"
                className={inputClass}
              />
              <select value={line.tax_code_id || ''} onChange={(e) => update(index, { tax_code_id: Number(e.target.value) })} aria-label="Tax" className={inputClass}>
                <option value="">No tax</option>
                {taxCodes
                  .filter((t) => t.is_active || t.tax_code_id === line.tax_code_id)
                  .map((t) => (
                    <option key={t.tax_code_id} value={t.tax_code_id}>
                      {t.name} ({formatRate(totalRate(t))})
                    </option>
                  ))}
              </select>
              <span className="text-right text-sm font-semibold tabular-nums text-slate-900">{line.item_id ? rupees(m.total) : '—'}</span>
              <span className="flex justify-end">
                {lines.length > 1 && <IconAction icon={Trash2} label="Remove" tone="danger" onClick={() => onChange(lines.filter((_, i) => i !== index))} />}
              </span>
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={() => onChange([...lines, newLine()])} className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10">
        <Plus className="h-4 w-4" /> Add item
      </button>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="tabular-nums text-slate-900">{rupees(totals.net)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Discount</dt>
            <dd>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={discount || ''}
                onChange={(e) => onDiscount(Number(e.target.value))}
                placeholder="0"
                aria-label="Discount on the whole document"
                className="w-28 rounded-lg bg-white px-2.5 py-1.5 text-right text-sm tabular-nums ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Tax</dt>
            <dd className="tabular-nums text-slate-900">{rupees(totals.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold">
            <dt className="text-slate-900">Total</dt>
            <dd className="tabular-nums text-slate-900">{rupees(totals.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

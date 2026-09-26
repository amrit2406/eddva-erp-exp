import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ScanLine, ShoppingBasket, Trash2 } from 'lucide-react';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import { Field } from '../../../../components/premium/form/FormParts';
import { btnPrimary, btnSecondary, cardClass, inputClass } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import type { CanteenMember, MenuCategory, MenuItem, PosTerminal, Shift } from '../../types/canteen.types';
import { FoodMark, ItemThumb } from '../menu/FoodMark';

export interface BasketLine {
  // Present for lines already saved on an order (edit mode).
  lineId?: string;
  itemId: string;
  quantity: number;
}

export interface OrderValues {
  memberId: string;
  terminalId: string;
  discount: number;
  lines: BasketLine[];
}

interface OrderBuilderProps {
  items: MenuItem[];
  categories: MenuCategory[];
  members: CanteenMember[];
  terminals: PosTerminal[];
  shifts: Shift[];
  defaultValues?: Partial<OrderValues>;
  onSubmit: (values: OrderValues) => void;
  onCancel: () => void;
  submitText: string;
  isSubmitting: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function OrderBuilder({ items, categories, members, terminals, shifts, defaultValues, onSubmit, onCancel, submitText, isSubmitting }: OrderBuilderProps) {
  const openCounters = new Set(shifts.filter((s) => s.status === 'OPEN').map((s) => s.terminalId));
  const onlyOpen = terminals.filter((t) => openCounters.has(t.id));
  const [memberId, setMemberId] = useState(defaultValues?.memberId ?? '');
  // With exactly one counter open, that's almost certainly where the order is being taken.
  const [terminalId, setTerminalId] = useState(defaultValues?.terminalId ?? (onlyOpen.length === 1 ? onlyOpen[0].id : ''));
  const [discount, setDiscount] = useState(defaultValues?.discount ? String(defaultValues.discount) : '');
  const [lines, setLines] = useState<BasketLine[]>(defaultValues?.lines ?? []);
  const [scan, setScan] = useState('');
  const [scanMiss, setScanMiss] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const member = members.find((m) => m.id === memberId);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => !category || i.categoryId === category)
      .filter((i) => !q || i.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable) || a.name.localeCompare(b.name));
  }, [items, search, category]);

  const qtyOf = (itemId: string) => lines.find((l) => l.itemId === itemId)?.quantity ?? 0;
  const setQty = (itemId: string, quantity: number) =>
    setLines((current) => {
      if (quantity <= 0) return current.filter((l) => l.itemId !== itemId);
      if (current.some((l) => l.itemId === itemId)) return current.map((l) => (l.itemId === itemId ? { ...l, quantity } : l));
      return [...current, { itemId, quantity }];
    });

  const priced = lines.map((l) => {
    const item = byId.get(l.itemId);
    const price = toNumber(item?.price);
    const amount = price * l.quantity;
    return { ...l, item, price, amount, tax: (amount * toNumber(item?.taxRate)) / 100 };
  });
  const subtotal = round2(priced.reduce((s, l) => s + l.amount, 0));
  const tax = round2(priced.reduce((s, l) => s + l.tax, 0));
  const discountValue = discount.trim() === '' ? 0 : Number(discount);
  const total = round2(subtotal + tax - (Number.isFinite(discountValue) ? discountValue : 0));
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  const errors = {
    memberId: !memberId ? 'Choose who the order is for' : undefined,
    terminalId: !terminalId ? 'Choose the counter' : undefined,
    lines: lines.length === 0 ? 'Add at least one item' : undefined,
    discount: !Number.isFinite(discountValue) || discountValue < 0 ? 'Enter 0 or more' : discountValue > subtotal + tax ? 'Discount is more than the bill' : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);

  // A scanner types the card number and presses Enter.
  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const code = scan.trim().toLowerCase();
    if (!code) return;
    const found = members.find((m) => m.idCardBarcode.toLowerCase() === code || m.externalRefId.toLowerCase() === code);
    setScanMiss(!found);
    if (found) {
      setMemberId(found.id);
      setScan('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    onSubmit({ memberId, terminalId, discount: discountValue, lines });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
      {/* Menu */}
      <section className={`${cardClass} space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBox value={search} onChange={setSearch} placeholder="Find an item" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ id: '', name: 'All' }, ...categories].map((c) => (
            <button
              key={c.id || 'all'}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${category === c.id ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No items match.</p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
            {shown.map((item) => {
              const qty = qtyOf(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl p-2.5 ring-1 transition ${qty ? 'bg-brand/5 ring-2 ring-brand' : 'bg-white ring-slate-200'} ${item.isAvailable ? '' : 'opacity-50'}`}
                >
                  <ItemThumb src={item.imageUrl} alt={item.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-start gap-1.5 text-sm font-medium leading-snug text-slate-900">
                      <span className="mt-[3px]">
                        <FoodMark type={item.foodType} />
                      </span>
                      <span className="line-clamp-2">{item.name}</span>
                    </p>
                    <p className="text-xs text-slate-500">{item.isAvailable ? rupees(toNumber(item.price)) : 'Off menu'}</p>
                  </div>
                  {qty === 0 ? (
                    <button
                      type="button"
                      disabled={!item.isAvailable}
                      onClick={() => setQty(item.id, 1)}
                      aria-label={`Add ${item.name}`}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <Stepper value={qty} onChange={(q) => setQty(item.id, q)} label={item.name} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Basket */}
      <aside className="space-y-4 lg:sticky lg:top-4">
        <section className={`${cardClass} space-y-4`}>
          <Field label="Member" error={show(errors.memberId)}>
            <div className="relative mb-2">
              <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={scan}
                onChange={(e) => {
                  setScan(e.target.value);
                  setScanMiss(false);
                }}
                onKeyDown={handleScan}
                placeholder="Scan ID card, then press Enter"
                autoComplete="off"
                className={`${inputClass} pl-9`}
              />
            </div>
            {scanMiss && <span className="mb-2 block text-xs text-red-600">No member with that card.</span>}
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputClass}>
              <option value="">…or choose from the list</option>
              {[...members]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.externalRefId}
                  </option>
                ))}
            </select>
          </Field>
          {member?.wallet && (
            <p className="-mt-2 text-xs text-slate-500">
              Wallet: <span className="font-medium text-slate-700">{rupees(toNumber(member.wallet.balance))}</span>
              {member.wallet.status === 'BLOCKED' && <span className="font-medium text-red-600"> (blocked)</span>}
            </p>
          )}
          <Field label="Counter" error={show(errors.terminalId)} hint={terminalId && !openCounters.has(terminalId) ? 'No shift is open on this counter.' : undefined}>
            <select value={terminalId} onChange={(e) => setTerminalId(e.target.value)} className={inputClass}>
              <option value="">Choose the counter</option>
              {terminals.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {openCounters.has(t.id) ? ' · open' : ''}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <section className={cardClass}>
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBasket className="h-4 w-4 text-brand-navy" />
            <h2 className="text-[15px] font-semibold text-slate-900">Order</h2>
            {itemCount > 0 && <span className="text-xs text-slate-500">· {itemCount} item{itemCount === 1 ? '' : 's'}</span>}
          </div>

          {priced.length === 0 ? (
            <p className={`rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm ${show(errors.lines) ? 'text-red-600' : 'text-slate-500'}`}>Tap + on an item to add it.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {priced.map((l) => (
                <li key={l.itemId} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{l.item?.name ?? 'Item no longer on the menu'}</p>
                    <p className="text-xs text-slate-500">{rupees(l.price)} each</p>
                  </div>
                  <Stepper value={l.quantity} onChange={(q) => setQty(l.itemId, q)} label={l.item?.name ?? 'item'} />
                  <span className="w-16 text-right text-sm font-medium tabular-nums text-slate-900">{rupees(round2(l.amount))}</span>
                  <button type="button" onClick={() => setQty(l.itemId, 0)} aria-label={`Remove ${l.item?.name ?? 'item'}`} className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Items</dt>
              <dd className="tabular-nums">{rupees(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Tax</dt>
              <dd className="tabular-nums">{rupees(tax)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-600">
              <dt>Discount (₹)</dt>
              <dd>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  aria-label="Discount in rupees"
                  className="w-24 rounded-lg bg-white px-2 py-1 text-right text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </dd>
            </div>
            {errors.discount && (discount !== '' || showErrors) && <p className="text-right text-xs text-red-600">{errors.discount}</p>}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
              <dt>Total</dt>
              <dd className="tabular-nums">{rupees(Math.max(0, total))}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-col gap-2">
            <button type="submit" disabled={isSubmitting} className={btnPrimary}>
              {isSubmitting ? 'Saving…' : submitText}
            </button>
            <button type="button" onClick={onCancel} disabled={isSubmitting} className={btnSecondary}>
              Cancel
            </button>
          </div>
          {members.length === 0 && (
            <p className="mt-3 text-xs text-slate-500">
              No members yet —{' '}
              <Link to="/canteen/members/new" className="font-medium text-brand hover:text-brand-navy">
                add one first
              </Link>
              .
            </p>
          )}
        </section>
      </aside>
    </form>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <span className="inline-flex flex-shrink-0 items-center rounded-xl bg-white ring-1 ring-slate-200">
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`One less ${label}`} className="flex h-7 w-7 items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-100">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums text-slate-900">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`One more ${label}`} className="flex h-7 w-7 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-100">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

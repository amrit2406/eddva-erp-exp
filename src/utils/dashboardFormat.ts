import { formatCurrency } from './formatCurrency';

// The API mixes numbers and numeric strings ("5000.00").
export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  return Number.isFinite(n) ? (n as number) : 0;
}

// "PENDING_APPROVAL" / "walk_in" -> "Pending approval" / "Walk in".
export function humanize(value: string): string {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Whole rupees on axes and tiles; paise add noise at dashboard level.
export function rupees(value: number): string {
  return formatCurrency(value).replace(/\.00$/, '');
}

// Axis ticks: ₹1.2L / ₹12K instead of full amounts.
export function compactRupees(value: number): string {
  if (value >= 100000) return `₹${Math.round(value / 10000) / 10}L`;
  if (value >= 1000) return `₹${Math.round(value / 100) / 10}K`;
  return `₹${value}`;
}

export interface DateRangeLike {
  from: string | null;
  to: string | null;
}

// Dashboard period label: "All time" when the API applied no range.
export function rangeLabel(range?: DateRangeLike): string {
  if (!range?.from && !range?.to) return 'All time';
  const format = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${range.from ? format(range.from) : '…'} – ${range.to ? format(range.to) : 'today'}`;
}

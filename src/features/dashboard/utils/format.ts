import { formatCurrency } from '../../../utils/formatCurrency';

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

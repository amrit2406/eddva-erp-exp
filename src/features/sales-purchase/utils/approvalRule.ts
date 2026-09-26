import { rupees } from '../../../utils/dashboardFormat';

type Amount = number | string | null | undefined;

const has = (v: Amount) => v !== null && v !== undefined && v !== '';

// "Up to ₹50,000" / "₹50,000 – ₹2,00,000" / "₹2,00,000 and above" / "Any amount".
export function amountRange(min: Amount, max: Amount): string {
  const lo = has(min) ? Number(min) : 0;
  if (has(max)) return lo > 0 ? `${rupees(lo)} – ${rupees(Number(max))}` : `Up to ${rupees(Number(max))}`;
  return lo > 0 ? `${rupees(lo)} and above` : 'Any amount';
}

// Do two amount ranges share any value? Open ends count as unbounded.
export function rangesOverlap(aMin: Amount, aMax: Amount, bMin: Amount, bMax: Amount): boolean {
  const a0 = has(aMin) ? Number(aMin) : 0;
  const b0 = has(bMin) ? Number(bMin) : 0;
  const a1 = has(aMax) ? Number(aMax) : Number.POSITIVE_INFINITY;
  const b1 = has(bMax) ? Number(bMax) : Number.POSITIVE_INFINITY;
  return a0 <= b1 && b0 <= a1;
}

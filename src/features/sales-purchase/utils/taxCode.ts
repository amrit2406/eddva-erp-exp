import { toNumber } from '../../../utils/dashboardFormat';

// API values arrive as strings ("9.00"); form values are numbers.
type Rates = { cgst_pct: string | number; sgst_pct: string | number; igst_pct: string | number };

export type TaxKind = 'intra' | 'inter' | 'mixed' | 'none';

// Total % the backend charges: CGST + SGST + IGST, all added together.
export const totalRate = (t: Rates) => toNumber(t.cgst_pct) + toNumber(t.sgst_pct) + toNumber(t.igst_pct);

// Within-state (CGST+SGST), other-state (IGST), or both — which is usually a mistake.
export function taxKind(t: Rates): TaxKind {
  const local = toNumber(t.cgst_pct) + toNumber(t.sgst_pct) > 0;
  const inter = toNumber(t.igst_pct) > 0;
  if (local && inter) return 'mixed';
  if (inter) return 'inter';
  if (local) return 'intra';
  return 'none';
}

export const TAX_KIND_LABEL: Record<TaxKind, { label: string; color: string }> = {
  intra: { label: 'Within state', color: '#008BE9' },
  inter: { label: 'Other state', color: '#7c3aed' },
  mixed: { label: 'CGST + SGST + IGST', color: '#d03b3b' },
  none: { label: 'No tax', color: '#64748b' },
};

const pct = (n: number) => `${Number(n.toFixed(2))}%`;

// "CGST 9% + SGST 9%" / "IGST 18%" / "No tax".
export function taxBreakdown(t: Rates): string {
  const parts = [
    ['CGST', toNumber(t.cgst_pct)],
    ['SGST', toNumber(t.sgst_pct)],
    ['IGST', toNumber(t.igst_pct)],
  ].filter(([, v]) => (v as number) > 0);
  return parts.length ? parts.map(([k, v]) => `${k} ${pct(v as number)}`).join(' + ') : 'No tax';
}

export const formatRate = (n: number) => pct(n);

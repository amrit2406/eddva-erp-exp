import type { TaxCode } from '../types/sales-purchase.types';
import { totalRate } from './taxCode';

// The fields every order/invoice line has; callers may carry extra link ids.
export interface BaseLine {
  item_id: number;
  quantity: number;
  unit_price: number;
  tax_code_id: number;
  line_discount?: number;
}

export const emptyLine: BaseLine = { item_id: 0, quantity: 0, unit_price: 0, tax_code_id: 0, line_discount: 0 };

// Same maths as the backend: CGST + SGST + IGST all apply after the line discount.
export function lineMath(line: BaseLine, tax?: TaxCode) {
  const net = Math.max(0, line.quantity * line.unit_price - (line.line_discount ?? 0));
  const taxAmount = (net * (tax ? totalRate(tax) : 0)) / 100;
  return { net, tax: taxAmount, total: net + taxAmount };
}

export function linesTotals(lines: BaseLine[], taxById: Map<number, TaxCode>, discount: number) {
  const sums = lines.reduce(
    (s, l) => {
      if (!l.item_id) return s;
      const m = lineMath(l, taxById.get(l.tax_code_id));
      return { net: s.net + m.net, tax: s.tax + m.tax };
    },
    { net: 0, tax: 0 },
  );
  return { ...sums, total: Math.max(0, sums.net - discount + sums.tax) };
}

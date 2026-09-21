import { flattenRecord } from './format';
import type { GenericRecord } from '../types/hostel.types';

// RBAC resource the fee invoice endpoints are checked against.
export const INVOICES_RESOURCE = 'invoices';

export const PAYMENT_MODES = ['cash', 'card', 'upi', 'net_banking', 'cheque', 'bank_transfer'];

const DONE = ['paid', 'cancelled', 'canceled', 'void'];

// Which actions fit an invoice's status. An unknown status offers everything and
// lets the backend decide.
export function invoiceActions(status: string | null) {
  if (status === null) return { pay: true, cancel: true };
  const done = DONE.includes(status);
  return { pay: !done, cancel: !done };
}

const BALANCE_KEYS = ['balance', 'balance_due', 'outstanding_amount', 'outstanding', 'amount_due', 'due_amount'];

// What is still owed on an invoice, if the record says so — used only to prefill
// the payment amount.
export function balanceOf(invoice: GenericRecord): number | null {
  const flat = flattenRecord(invoice);
  for (const key of BALANCE_KEYS) {
    const value = Number(flat[key]);
    if (flat[key] !== null && flat[key] !== undefined && flat[key] !== '' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
}

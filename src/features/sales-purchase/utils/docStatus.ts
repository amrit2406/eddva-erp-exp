// Plain-language statuses for documents that go Draft -> Posted (GRNs, invoices).
export const DOC_STATUS: Record<string, { label: string; color: string; hint: string }> = {
  DRAFT: { label: 'Draft', color: '#64748b', hint: 'Not final yet — can still be changed' },
  POSTED: { label: 'Posted', color: '#15936a', hint: 'Final and recorded in the books' },
  CANCELLED: { label: 'Cancelled', color: '#94a3b8', hint: 'Cancelled and no longer counts' },
};

export const docStatusInfo = (s: string) =>
  DOC_STATUS[s] ?? { label: s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' '), color: '#64748b', hint: '' };

// Payment modes in everyday words.
export const PAYMENT_MODE: Record<string, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  CHEQUE: 'Cheque',
  NEFT: 'NEFT',
  RTGS: 'RTGS',
  IMPS: 'IMPS',
  BANK_TRANSFER: 'Bank transfer',
  CARD: 'Card',
};

export const paymentModeLabel = (m: string) => PAYMENT_MODE[m] ?? m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, ' ');

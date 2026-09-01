export const ADJUSTMENT_REASON_OPTIONS = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'expired', label: 'Expired' },
  { value: 'lost', label: 'Lost' },
  { value: 'audit_correction', label: 'Audit Correction' },
] as const;

export const LEDGER_TXN_TYPE_OPTIONS = [
  { value: 'purchase_in', label: 'Purchase In' },
  { value: 'transfer_out', label: 'Transfer Out' },
  { value: 'transfer_in', label: 'Transfer In' },
  { value: 'adjustment_in', label: 'Adjustment In' },
  { value: 'adjustment_out', label: 'Adjustment Out' },
  { value: 'issue_out', label: 'Issue Out' },
  { value: 'return_in', label: 'Return In' },
] as const;

export const LEDGER_REFERENCE_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'issue', label: 'Issue' },
  { value: 'return', label: 'Return' },
] as const;

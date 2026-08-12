// Purchase Order Constants

export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'pending_approval', label: 'Pending Approval', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'partially_received', label: 'Partially Received', color: 'blue' },
  { value: 'closed', label: 'Closed', color: 'purple' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const PURCHASE_ORDER_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  partially_received: 'bg-blue-100 text-blue-800',
  closed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const GRN_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'received', label: 'Received', color: 'blue' },
  { value: 'verified', label: 'Verified', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const GRN_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  received: 'bg-blue-100 text-blue-800',
  verified: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PURCHASE_PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid', color: 'red' },
  { value: 'partially_paid', label: 'Partially Paid', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
] as const;

export const PURCHASE_PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-800',
  partially_paid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
};

export const PURCHASE_PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
] as const;

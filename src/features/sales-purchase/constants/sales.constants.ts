// Sales Order Constants

export const SALES_ORDER_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'partially_delivered', label: 'Partially Delivered', color: 'blue' },
  { value: 'delivered', label: 'Delivered', color: 'purple' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const SALES_ORDER_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  confirmed: 'bg-green-100 text-green-800',
  partially_delivered: 'bg-blue-100 text-blue-800',
  delivered: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const SALES_PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid', color: 'red' },
  { value: 'partially_paid', label: 'Partially Paid', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
] as const;

export const SALES_PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-800',
  partially_paid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
};

export const SALES_PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
] as const;

export const ISSUE_STATUS_OPTIONS = [
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'issued', label: 'Issued' },
  { value: 'partially_returned', label: 'Partially Returned' },
  { value: 'returned', label: 'Returned' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const APPROVAL_STATUS_OPTIONS = [
  { value: 'not_required', label: 'Not Required' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const RETURN_CONDITION_OPTIONS = [
  { value: 'good', label: 'Good' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'unusable', label: 'Unusable' },
] as const;

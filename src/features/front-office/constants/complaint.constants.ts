// Complaint constants

export const COMPLAINT_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;

export const COMPLAINT_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

export const COMPLAINT_CATEGORY_OPTIONS = [
  { value: 'facilities', label: 'Facilities' },
  { value: 'staff', label: 'Staff' },
  { value: 'academic', label: 'Academic' },
  { value: 'transport', label: 'Transport' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
] as const;

export const COMPLAINT_QUERY_KEY = ['front-office', 'complaints'] as const;
export const COMPLAINT_UPDATE_QUERY_KEY = ['front-office', 'complaint-updates'] as const;

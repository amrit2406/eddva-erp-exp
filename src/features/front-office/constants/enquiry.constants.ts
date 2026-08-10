// Enquiry constants

export const ENQUIRY_SOURCE_OPTIONS = [
  { value: 'walk_in', label: 'Walk In' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
] as const;

export const ENQUIRY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
] as const;

export const ENQUIRY_CATEGORY_OPTIONS = [
  { value: 'admission', label: 'Admission' },
  { value: 'sales', label: 'Sales' },
  { value: 'general', label: 'General' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Other' },
] as const;

export const ENQUIRY_FOLLOWUP_RESULT_OPTIONS = [
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'follow_up_later', label: 'Follow Up Later' },
  { value: 'converted', label: 'Converted' },
] as const;

export const ENQUIRY_QUERY_KEY = ['front-office', 'enquiries'] as const;
export const ENQUIRY_FOLLOWUP_QUERY_KEY = ['front-office', 'enquiry-followups'] as const;

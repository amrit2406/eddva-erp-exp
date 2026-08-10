// Visitor constants

export const VISITOR_STATUS_OPTIONS = [
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
] as const;

export const ID_PROOF_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'other', label: 'Other' },
] as const;

export const VISITOR_QUERY_KEY = ['front-office', 'visitors'] as const;
export const VISITOR_LOG_QUERY_KEY = ['front-office', 'visitor-logs'] as const;

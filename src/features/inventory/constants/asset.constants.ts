export const ASSET_STATUS_OPTIONS = [
  { value: 'in_store', label: 'In Store' },
  { value: 'issued', label: 'Issued' },
  { value: 'under_repair', label: 'Under Repair' },
  { value: 'disposed', label: 'Disposed' },
  { value: 'lost', label: 'Lost' },
] as const;

// Excludes 'issued' — that transition must go through the Issue/Return workflow,
// and the backend rejects a direct PATCH into or out of it.
export const ASSET_EDITABLE_STATUS_OPTIONS = ASSET_STATUS_OPTIONS.filter((opt) => opt.value !== 'issued');

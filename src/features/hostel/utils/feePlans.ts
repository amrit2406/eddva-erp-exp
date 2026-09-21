// RBAC resource the fee plan endpoints are checked against.
export const FEE_PLANS_RESOURCE = 'fee_plans';

// Free-text fields in the API, so these are suggestions rather than a fixed list.
export const BILLING_CYCLES = ['monthly', 'quarterly', 'half_yearly', 'yearly'];
export const ROOM_TYPE_SUGGESTIONS = ['single', 'double', 'triple', 'dormitory'];

export function cycleLabel(cycle: string): string {
  return cycle.replace(/_/g, ' ');
}

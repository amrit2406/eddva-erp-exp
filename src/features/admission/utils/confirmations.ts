import type { Confirmation } from '../types/admission.types';

// RBAC resource the confirmation endpoints are checked against.
export const CONFIRMATIONS_RESOURCE = 'confirmations';

export function confirmationApplicantName(confirmation: Confirmation): string {
  return confirmation.application?.applicant?.name ?? `Application #${confirmation.application_id}`;
}

// Cancelling and linking a student only apply to a confirmation that still stands.
export function isConfirmed(confirmation: Confirmation): boolean {
  return confirmation.status === 'confirmed';
}

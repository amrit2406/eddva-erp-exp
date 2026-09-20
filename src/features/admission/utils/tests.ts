import type { TestRegistration } from '../types/admission.types';

export function registrationLabel(registration: TestRegistration): string {
  return registration.application?.applicant?.name ?? `Application #${registration.application_id}`;
}

// Marks as a percentage of the maximum, rounded to one decimal; '' when it can't be computed.
export function percentOf(marks: number | string | null | undefined, max: number | string): string {
  const value = Number(marks);
  const total = Number(max);
  if (marks === null || marks === undefined || marks === '' || Number.isNaN(value) || !total) return '';
  return `${Math.round((value / total) * 1000) / 10}%`;
}

// RBAC resource the entrance-test endpoints are checked against.
export const TESTS_RESOURCE = 'tests';

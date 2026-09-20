import type { Offer } from '../types/admission.types';

// RBAC resource the offer endpoints are checked against.
export const OFFERS_RESOURCE = 'offers';

export function offerApplicantName(offer: Offer): string {
  return offer.application?.applicant?.name ?? `Application #${offer.application_id}`;
}

// Only an offer still awaiting a response can be accepted or declined.
export function awaitingResponse(offer: Offer): boolean {
  return offer.status === 'issued';
}

export function isPastExpiry(offer: Offer): boolean {
  return new Date(offer.offer_expiry_date).getTime() < Date.now();
}

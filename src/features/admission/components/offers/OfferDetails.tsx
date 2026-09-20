import { Link } from 'react-router-dom';
import OfferStatusBadge from './OfferStatusBadge';
import { formatDate, formatDateTime } from '../../utils/format';
import { awaitingResponse, isPastExpiry } from '../../utils/offers';
import type { Offer } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

// Shared by the offer page and the offer panel on the application page.
export default function OfferDetails({ offer, linkToApplication }: { offer: Offer; linkToApplication?: boolean }) {
  const lapsed = awaitingResponse(offer) && isPastExpiry(offer);

  return (
    <dl className="space-y-4">
      {linkToApplication && (
        <Detail label="Application">
          <Link to={`/admission/applications/${offer.application_id}`} className="text-[#008BE9] hover:underline">
            Application #{offer.application_id}
          </Link>
        </Detail>
      )}
      <Detail label="Status">
        <OfferStatusBadge status={offer.status} />
      </Detail>
      <Detail label="Seat Category">{offer.seat_category || '—'}</Detail>
      <Detail label="Offer Date">{formatDate(offer.offer_date)}</Detail>
      <Detail label="Valid Until">
        {formatDateTime(offer.offer_expiry_date)}
        {lapsed && <span className="ml-2 text-sm text-red-600">Past its expiry</span>}
      </Detail>
      {offer.status === 'declined' && offer.decline_reason && (
        <Detail label="Decline Reason">{offer.decline_reason}</Detail>
      )}
      {offer.responded_at && <Detail label="Responded">{formatDateTime(offer.responded_at)}</Detail>}
    </dl>
  );
}

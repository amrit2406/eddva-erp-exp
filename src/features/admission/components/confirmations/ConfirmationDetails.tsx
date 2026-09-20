import { Link } from 'react-router-dom';
import ConfirmationStatusBadge from './ConfirmationStatusBadge';
import { formatDateTime } from '../../utils/format';
import type { Confirmation } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

// Shared by the confirmation page and the panel on the application page.
export default function ConfirmationDetails({
  confirmation,
  linkToApplication,
}: {
  confirmation: Confirmation;
  linkToApplication?: boolean;
}) {
  return (
    <dl className="space-y-4">
      {linkToApplication && (
        <Detail label="Application">
          <Link to={`/admission/applications/${confirmation.application_id}`} className="text-[#008BE9] hover:underline">
            Application #{confirmation.application_id}
          </Link>
        </Detail>
      )}
      <Detail label="Status">
        <ConfirmationStatusBadge status={confirmation.status} />
      </Detail>
      <Detail label="Confirmed On">{formatDateTime(confirmation.confirmed_at ?? confirmation.created_at)}</Detail>
      <Detail label="Student Record">
        {confirmation.student_ref ? (
          <span className="font-medium">{confirmation.student_ref}</span>
        ) : (
          <span className="text-slate-500">Not linked to a student record yet</span>
        )}
      </Detail>
      {confirmation.status === 'cancelled' && (
        <>
          {confirmation.cancel_reason && <Detail label="Cancellation Reason">{confirmation.cancel_reason}</Detail>}
          {confirmation.cancelled_at && <Detail label="Cancelled On">{formatDateTime(confirmation.cancelled_at)}</Detail>}
        </>
      )}
    </dl>
  );
}

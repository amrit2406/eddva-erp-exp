import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ReasonModal from '../common/ReasonModal';
import { acceptOffer, declineOffer } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { awaitingResponse, offerApplicantName } from '../../utils/offers';
import type { Offer } from '../../types/admission.types';

interface OfferActionsProps {
  offer: Offer;
  canUpdate: boolean;
  onChanged: () => void;
}

// Accept / decline for an offer that is still awaiting a response.
export default function OfferActions({ offer, canUpdate, onChanged }: OfferActionsProps) {
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canUpdate || !awaitingResponse(offer)) return null;

  const name = offerApplicantName(offer);

  const handleAccept = async () => {
    if (!window.confirm(`Record that ${name} accepted this offer?`)) return;
    try {
      setAccepting(true);
      await acceptOffer(offer.application_id);
      toast.success('Offer accepted');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to accept offer'));
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async (reason: string) => {
    try {
      setSubmitting(true);
      setError(null);
      await declineOffer(offer.application_id, reason);
      toast.success('Offer declined');
      setDeclining(false);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to decline offer'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={accepting} onClick={handleAccept}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {accepting ? 'Accepting...' : 'Accept'}
        </Button>
        <Button
          variant="secondary"
          disabled={accepting}
          onClick={() => {
            setError(null);
            setDeclining(true);
          }}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>

      {declining && (
        <ReasonModal
          title="Decline Offer"
          description={
            <>
              Record that <span className="font-medium text-slate-900">{name}</span> declined this offer.
            </>
          }
          placeholder="e.g. Family relocating"
          submitLabel="Decline Offer"
          submittingLabel="Declining..."
          submitting={submitting}
          error={error}
          onSubmit={handleDecline}
          onClose={() => setDeclining(false)}
        />
      )}
    </>
  );
}

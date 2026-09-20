import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../common/AccessNotice';
import IssueOfferForm from './IssueOfferForm';
import OfferActions from './OfferActions';
import OfferDetails from './OfferDetails';
import { getApplicationOffer, issueOffer } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { OFFERS_RESOURCE } from '../../utils/offers';
import type { Offer, OfferFormData } from '../../types/admission.types';

interface ApplicationOfferPanelProps {
  applicationId: number;
  // Accepting or declining can move the application forward, so the page refreshes.
  onChanged: () => void;
}

export default function ApplicationOfferPanel({ applicationId, onChanged }: ApplicationOfferPanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(OFFERS_RESOURCE);
  // undefined = still loading; null = no offer yet.
  const [offer, setOffer] = useState<Offer | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [issuing, setIssuing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getApplicationOffer(applicationId)
      .then((data) => {
        if (cancelled) return;
        setOffer(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load offer'));
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  const afterChange = () => {
    setReloadKey((key) => key + 1);
    onChanged();
  };

  const handleIssue = async (data: OfferFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await issueOffer(applicationId, data);
      toast.success('Offer issued');
      setIssuing(false);
      afterChange();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to issue offer'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Admission Offer</h2>
          {offer && (
            <Link
              to={`/admission/offers/${offer.offer_id}`}
              className="inline-flex items-center gap-1 text-sm text-[#008BE9] hover:underline"
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          {ready && offer === null && can('create') && !issuing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIssuing(true);
                setError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Issue Offer
            </Button>
          )}
        </div>

        {/* View-only admins already get the page-level notice. */}
        {ready && !can('create') && !can('update') && !isViewOnlyAdmin && <AccessNotice isViewOnlyAdmin={false} />}

        {loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : offer === undefined ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : offer ? (
          <div className="space-y-5">
            <OfferDetails offer={offer} />
            <OfferActions offer={offer} canUpdate={can('update')} onChanged={afterChange} />
          </div>
        ) : issuing ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <IssueOfferForm
              submitting={submitting}
              error={error}
              onSubmit={handleIssue}
              onCancel={() => setIssuing(false)}
            />
          </div>
        ) : (
          <div className="text-center text-slate-500 py-4">No offer has been issued for this application</div>
        )}
      </div>
    </Card>
  );
}

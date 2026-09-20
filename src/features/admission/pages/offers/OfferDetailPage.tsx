import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import OfferActions from '../../components/offers/OfferActions';
import OfferDetails from '../../components/offers/OfferDetails';
import OfferStatusBadge from '../../components/offers/OfferStatusBadge';
import { getOffer } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { OFFERS_RESOURCE, awaitingResponse, offerApplicantName } from '../../utils/offers';
import type { Offer } from '../../types/admission.types';

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(OFFERS_RESOURCE);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getOffer(id)
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
  }, [id, reloadKey]);

  const backLink = (
    <Link to="/admission/offers" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All offers
    </Link>
  );

  if (loadError || !offer || !ready) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="border-slate-200">
          {loadError ? (
            <div className="p-8 text-center text-red-500">{loadError}</div>
          ) : (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          )}
        </Card>
      </div>
    );
  }

  const canUpdate = can('update');

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{offerApplicantName(offer)}</h1>
        <OfferStatusBadge status={offer.status} />
      </div>

      {!canUpdate && awaitingResponse(offer) && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200 max-w-2xl">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Offer Details</h2>
          <OfferDetails offer={offer} linkToApplication />
          <OfferActions offer={offer} canUpdate={canUpdate} onChanged={() => setReloadKey((key) => key + 1)} />
        </div>
      </Card>
    </div>
  );
}

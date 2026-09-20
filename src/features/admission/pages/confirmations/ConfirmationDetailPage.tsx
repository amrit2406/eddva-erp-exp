import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import ConfirmationActions from '../../components/confirmations/ConfirmationActions';
import ConfirmationDetails from '../../components/confirmations/ConfirmationDetails';
import ConfirmationStatusBadge from '../../components/confirmations/ConfirmationStatusBadge';
import { getConfirmation } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { CONFIRMATIONS_RESOURCE, confirmationApplicantName, isConfirmed } from '../../utils/confirmations';
import type { Confirmation } from '../../types/admission.types';

export default function ConfirmationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(CONFIRMATIONS_RESOURCE);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getConfirmation(id)
      .then((data) => {
        if (cancelled) return;
        setConfirmation(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load confirmation'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const backLink = (
    <Link to="/admission/confirmations" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All confirmations
    </Link>
  );

  if (loadError || !confirmation || !ready) {
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
        <h1 className="text-2xl font-bold text-slate-900">{confirmationApplicantName(confirmation)}</h1>
        <ConfirmationStatusBadge status={confirmation.status} />
      </div>

      {!canUpdate && isConfirmed(confirmation) && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200 max-w-2xl">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Confirmation Details</h2>
          <ConfirmationDetails confirmation={confirmation} linkToApplication />
          <ConfirmationActions
            confirmation={confirmation}
            canUpdate={canUpdate}
            onChanged={() => setReloadKey((key) => key + 1)}
          />
        </div>
      </Card>
    </div>
  );
}

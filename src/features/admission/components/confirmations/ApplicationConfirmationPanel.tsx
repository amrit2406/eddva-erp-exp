import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../common/AccessNotice';
import ConfirmationActions from './ConfirmationActions';
import ConfirmationDetails from './ConfirmationDetails';
import { confirmAdmission, getApplicationConfirmation } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { CONFIRMATIONS_RESOURCE } from '../../utils/confirmations';
import type { Confirmation } from '../../types/admission.types';

interface ApplicationConfirmationPanelProps {
  applicationId: number;
  applicantName: string;
  // Confirming or cancelling changes the application, so the page refreshes.
  onChanged: () => void;
}

export default function ApplicationConfirmationPanel({
  applicationId,
  applicantName,
  onChanged,
}: ApplicationConfirmationPanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(CONFIRMATIONS_RESOURCE);
  // undefined = still loading; null = not confirmed yet.
  const [confirmation, setConfirmation] = useState<Confirmation | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getApplicationConfirmation(applicationId)
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
  }, [applicationId, reloadKey]);

  const afterChange = () => {
    setReloadKey((key) => key + 1);
    onChanged();
  };

  const handleConfirm = async () => {
    if (!window.confirm(`Confirm the admission of ${applicantName}?`)) return;
    try {
      setConfirming(true);
      await confirmAdmission(applicationId);
      toast.success('Admission confirmed');
      afterChange();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to confirm admission'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Admission Confirmation</h2>
          {confirmation && (
            <Link
              to={`/admission/confirmations/${confirmation.confirmation_id}`}
              className="inline-flex items-center gap-1 text-sm text-[#008BE9] hover:underline"
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          {ready && confirmation === null && can('create') && (
            <Button variant="primary" size="sm" disabled={confirming} onClick={handleConfirm}>
              <BadgeCheck className="h-4 w-4 mr-1" />
              {confirming ? 'Confirming...' : 'Confirm Admission'}
            </Button>
          )}
        </div>

        {/* View-only admins already get the page-level notice. */}
        {ready && !can('create') && !can('update') && !isViewOnlyAdmin && <AccessNotice isViewOnlyAdmin={false} />}

        {loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : confirmation === undefined ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : confirmation ? (
          <div className="space-y-5">
            <ConfirmationDetails confirmation={confirmation} />
            <ConfirmationActions confirmation={confirmation} canUpdate={can('update')} onChanged={afterChange} />
          </div>
        ) : (
          <div className="text-center text-slate-500 py-4">This admission hasn't been confirmed yet</div>
        )}
      </div>
    </Card>
  );
}

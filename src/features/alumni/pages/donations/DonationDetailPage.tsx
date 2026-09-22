import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Ban, Check, Download, RotateCcw, X, ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../../components/common/GenericDataView';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import {
  cancelDonation,
  confirmDonation,
  downloadDonationReceipt,
  failDonation,
  getDonation,
  reverseDonation,
} from '../../api/donations.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import { todayISO } from '../../utils/format';
import type { GenericRecord } from '../../types/profile.types';

type ModalKind = 'confirm' | 'fail' | 'cancel' | 'reverse' | null;

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const PAYMENT_MODES = ['upi', 'card', 'netbanking', 'cash', 'cheque', 'bank_transfer'];

// Only pending donations can move forward or be reversed after settlement;
// the exact status enum isn't documented, so an unknown status shows everything.
function actionsFor(status: string | null) {
  if (status === null) return { confirm: true, fail: true, cancel: true, reverse: true };
  const pending = status === 'pending' || status === 'initiated';
  return {
    confirm: pending,
    fail: pending,
    cancel: pending,
    reverse: status === 'confirmed' || status === 'completed',
  };
}

export default function DonationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('donations');
  const [donation, setDonation] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [receivedOn, setReceivedOn] = useState(todayISO());
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const reload = async () => {
    if (!id) return;
    setDonation(await getDonation(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getDonation(id)
      .then((data) => {
        if (!cancelled) setDonation(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load donation'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const closeModal = () => {
    setModal(null);
    setReason('');
    setActionError(null);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActing(true);
      setActionError(null);
      await confirmDonation(id, { transaction_ref: transactionRef, payment_mode: paymentMode, received_on: receivedOn });
      toast.success('Donation confirmed');
      closeModal();
      await reload();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to confirm donation'));
    } finally {
      setActing(false);
    }
  };

  const runReasonAction = async (
    action: (id: string, reason: string) => Promise<void>,
    successMessage: string
  ) => {
    if (!id) return;
    try {
      setActing(true);
      setActionError(null);
      await action(id, reason);
      toast.success(successMessage);
      closeModal();
      await reload();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Action failed'));
    } finally {
      setActing(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!id) return;
    try {
      setDownloading(true);
      await downloadDonationReceipt(id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download receipt'));
    } finally {
      setDownloading(false);
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!donation) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = recordStatus(donation);
  const allowed = actionsFor(status);
  const alumniId = relatedId(donation, 'alumni', 'alumni_id');
  const campaignId = relatedId(donation, 'campaign', 'campaign_id');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/donations" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to donations
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Donation #{id}</h1>
              <RecordStatusBadge status={status} />
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {alumniId && (
                <Link to={`/alumni/profiles/${alumniId}`} className="text-blue-600 hover:underline">
                  View donor profile
                </Link>
              )}
              {campaignId && (
                <Link to={`/alumni/campaigns/${campaignId}`} className="text-blue-600 hover:underline">
                  View campaign
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleDownloadReceipt} disabled={downloading}>
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading...' : 'Receipt'}
            </Button>
            {allowed.confirm && can('confirm') && (
              <Button
                variant="primary"
                onClick={() => {
                  setTransactionRef(typeof donation.transaction_ref === 'string' ? donation.transaction_ref : '');
                  setModal('confirm');
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
            {allowed.fail && (can('update') || can('confirm')) && (
              <Button variant="secondary" onClick={() => setModal('fail')}>
                <X className="h-4 w-4 mr-2" />
                Mark Failed
              </Button>
            )}
            {allowed.cancel && (can('update') || can('confirm')) && (
              <Button variant="ghost" onClick={() => setModal('cancel')}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Cancel
              </Button>
            )}
            {allowed.reverse && (can('update') || can('confirm')) && (
              <Button variant="ghost" onClick={() => setModal('reverse')}>
                <RotateCcw className="h-4 w-4 mr-2 text-red-600" />
                Reverse
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={donation} emptyMessage="No details available" />
      </Card>

      <Modal isOpen={modal === 'confirm'} onClose={() => !acting && closeModal()} title="Confirm Donation">
        <form onSubmit={handleConfirm} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
          )}
          <div>
            <label htmlFor="confirm_ref" className="block text-sm font-medium text-slate-700 mb-1">
              Transaction Reference *
            </label>
            <input
              id="confirm_ref"
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="confirm_mode" className="block text-sm font-medium text-slate-700 mb-1">
              Payment Mode *
            </label>
            <select
              id="confirm_mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className={inputClass}
              required
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="confirm_received_on" className="block text-sm font-medium text-slate-700 mb-1">
              Received On *
            </label>
            <input
              id="confirm_received_on"
              type="date"
              value={receivedOn}
              onChange={(e) => setReceivedOn(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={acting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={acting}>
              {acting ? 'Confirming...' : 'Confirm Donation'}
            </Button>
          </div>
        </form>
      </Modal>

      {(['fail', 'cancel', 'reverse'] as const).map((kind) => (
        <Modal
          key={kind}
          isOpen={modal === kind}
          onClose={() => !acting && closeModal()}
          title={kind === 'fail' ? 'Mark Donation Failed' : kind === 'cancel' ? 'Cancel Donation' : 'Reverse Donation'}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const action = kind === 'fail' ? failDonation : kind === 'cancel' ? cancelDonation : reverseDonation;
              const message = kind === 'fail' ? 'Donation marked failed' : kind === 'cancel' ? 'Donation cancelled' : 'Donation reversed';
              runReasonAction(action, message);
            }}
            className="space-y-4"
          >
            {actionError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
            )}
            <div>
              <label htmlFor={`${kind}_reason`} className="block text-sm font-medium text-slate-700 mb-1">
                Reason *
              </label>
              <textarea
                id={`${kind}_reason`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={kind === 'reverse' ? 'e.g. Cheque bounced' : undefined}
                className={inputClass}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={closeModal} disabled={acting}>
                Back
              </Button>
              <Button type="submit" variant="primary" disabled={acting}>
                {acting ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </form>
        </Modal>
      ))}
    </div>
  );
}

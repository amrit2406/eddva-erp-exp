import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../common/AccessNotice';
import FeePaymentForm from '../applications/FeePaymentForm';
import { getApplicationAdmissionPayments, payAdmissionFee } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatCurrency, formatDate, formatLabel } from '../../utils/format';
import { newIdempotencyKey } from '../../utils/idempotency';
import { PAYMENTS_RESOURCE } from '../../utils/payments';
import type { AdmissionPayment, FeePaymentFormData } from '../../types/admission.types';

interface AdmissionFeePanelProps {
  applicationId: number;
  // Paying can move the application forward server-side, so the page refreshes.
  onChanged: () => void;
}

export default function AdmissionFeePanel({ applicationId, onChanged }: AdmissionFeePanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(PAYMENTS_RESOURCE);
  const [payments, setPayments] = useState<AdmissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // A key exists only while the payment form is open, and is reused if the
  // submit is retried after an error.
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getApplicationAdmissionPayments(applicationId)
      .then((data) => {
        if (cancelled) return;
        setPayments([...data].sort((a, b) => b.created_at.localeCompare(a.created_at)));
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load admission payments'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  const handlePay = async (data: FeePaymentFormData) => {
    if (!idempotencyKey) return;
    try {
      setSubmitting(true);
      setError(null);
      await payAdmissionFee(applicationId, data, idempotencyKey);
      toast.success('Payment recorded');
      setIdempotencyKey(null);
      setReloadKey((key) => key + 1);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to record payment'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount_paid), 0);

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Admission Fee</h2>
            {!loading && !loadError && (
              <p className="text-sm text-slate-500 mt-0.5">
                {totalPaid > 0 ? (
                  <>Paid: <span className="font-medium text-green-700">{formatCurrency(totalPaid)}</span></>
                ) : (
                  'No payment recorded yet'
                )}
              </p>
            )}
          </div>
          {ready && can('create') && idempotencyKey === null && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIdempotencyKey(newIdempotencyKey());
                setError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Record Payment
            </Button>
          )}
        </div>

        {/* View-only admins already get the page-level notice. */}
        {ready && !can('create') && !isViewOnlyAdmin && <AccessNotice isViewOnlyAdmin={false} />}

        {idempotencyKey !== null && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <FeePaymentForm
              showStatus={false}
              submitting={submitting}
              error={error}
              onSubmit={handlePay}
              onCancel={() => setIdempotencyKey(null)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : payments.length === 0 ? (
          <div className="text-center text-slate-500 py-4">No payments recorded yet</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <li key={payment.payment_id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{formatCurrency(payment.amount_paid)}</span>
                  <p className="text-xs text-slate-500 mt-0.5 break-all">
                    <span className="capitalize">{formatLabel(payment.payment_mode)}</span>
                    {' · '}
                    {formatDate(payment.payment_date)}
                    {payment.transaction_ref ? ` · Ref ${payment.transaction_ref}` : ''}
                  </p>
                </div>
                <Link
                  to={`/admission/payments/${payment.payment_id}`}
                  title="Open payment"
                  className="text-slate-400 hover:text-[#008BE9] flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

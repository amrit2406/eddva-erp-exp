import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../common/AccessNotice';
import FeePaymentForm from './FeePaymentForm';
import PaymentStatusBadge from './PaymentStatusBadge';
import { getApplicationFeePayments, payApplicationFee, updateApplicationFeePayment } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatCurrency, formatDate, formatLabel } from '../../utils/format';
import { newIdempotencyKey } from '../../utils/idempotency';
import {
  PAYMENT_STATUSES,
  type ApplicationFeePayment,
  type FeePaymentFormData,
  type FeePaymentUpdateData,
  type PaymentStatus,
} from '../../types/admission.types';

// RBAC resource the fee endpoints are checked against.
const FEES_RESOURCE = 'fees';

interface ApplicationFeePanelProps {
  applicationId: number;
  // Paying can move the application forward server-side, so the page refreshes.
  onChanged: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

interface PaymentEditorProps {
  payment: ApplicationFeePayment;
  submitting: boolean;
  error: string | null;
  onSave: (data: FeePaymentUpdateData) => void;
  onCancel: () => void;
}

function PaymentEditor({ payment, submitting, error, onSave, onCancel }: PaymentEditorProps) {
  const [status, setStatus] = useState<PaymentStatus>(payment.status);
  const [reference, setReference] = useState(payment.transaction_ref ?? '');

  const trimmedRef = reference.trim();
  const statusChanged = status !== payment.status;
  const refChanged = trimmedRef !== '' && trimmedRef !== (payment.transaction_ref ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only changed fields are sent. A cleared reference is left alone rather
    // than sent as an empty value the API may reject.
    onSave({ ...(statusChanged && { status }), ...(refChanged && { transaction_ref: trimmedRef }) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            className={`${inputClass} capitalize`}
          >
            {PAYMENT_STATUSES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Transaction Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" size="sm" disabled={submitting || (!statusChanged && !refChanged)}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default function ApplicationFeePanel({ applicationId, onChanged }: ApplicationFeePanelProps) {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(FEES_RESOURCE);
  const [payments, setPayments] = useState<ApplicationFeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // A key exists only while the payment form is open, and is reused if the
  // submit is retried after an error.
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getApplicationFeePayments(applicationId)
      .then((data) => {
        if (cancelled) return;
        setPayments([...data].sort((a, b) => b.created_at.localeCompare(a.created_at)));
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load fee payments'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  const afterChange = () => {
    setReloadKey((key) => key + 1);
    onChanged();
  };

  const handlePay = async (data: FeePaymentFormData) => {
    if (!idempotencyKey) return;
    try {
      setSubmitting(true);
      setError(null);
      await payApplicationFee(applicationId, data, idempotencyKey);
      toast.success('Payment recorded');
      setIdempotencyKey(null);
      afterChange();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to record payment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payment: ApplicationFeePayment, data: FeePaymentUpdateData) => {
    try {
      setSubmitting(true);
      setError(null);
      await updateApplicationFeePayment(applicationId, payment.payment_id, data);
      toast.success('Payment updated');
      setEditingId(null);
      afterChange();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update payment'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = payments
    .filter((payment) => payment.status === 'success')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Application Fee</h2>
            {!loading && !loadError && (
              <p className="text-sm text-slate-500 mt-0.5">
                {totalPaid > 0 ? (
                  <>Paid: <span className="font-medium text-green-700">{formatCurrency(totalPaid)}</span></>
                ) : (
                  'No successful payment yet'
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
                setEditingId(null);
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
              <li key={payment.payment_id} className="py-3">
                {editingId === payment.payment_id ? (
                  <PaymentEditor
                    payment={payment}
                    submitting={submitting}
                    error={error}
                    onSave={(data) => handleUpdate(payment, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{formatCurrency(payment.amount)}</span>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 break-all">
                        <span className="capitalize">{formatLabel(payment.payment_mode)}</span>
                        {' · '}
                        {formatDate(payment.payment_date)}
                        {payment.transaction_ref ? ` · Ref ${payment.transaction_ref}` : ''}
                      </p>
                    </div>
                    {can('update') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Update status or reference"
                        onClick={() => {
                          setEditingId(payment.payment_id);
                          setIdempotencyKey(null);
                          setError(null);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

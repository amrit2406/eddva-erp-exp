import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../../components/common/GenericDataView';
import RecordPanel from '../../components/common/RecordPanel';
import { getEventRegistration, getRegistrationPayments, recordRegistrationPayment } from '../../api/eventRegistrations.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { relatedId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const PAYMENT_MODES = ['upi', 'card', 'netbanking', 'cash', 'bank_transfer'];

const EMPTY_PAYMENT = { amount: '', payment_mode: 'upi', transaction_ref: '', paid_at: '' };

export default function EventRegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('event_registrations');
  const [registration, setRegistration] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PAYMENT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentsKey, setPaymentsKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getEventRegistration(id)
      .then((data) => {
        if (!cancelled) setRegistration(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load registration'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadPayments = useCallback((params: ListParams) => getRegistrationPayments(id!, params), [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      const paidAt = form.paid_at ? new Date(form.paid_at).toISOString() : new Date().toISOString();
      await recordRegistrationPayment(id, {
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
        transaction_ref: form.transaction_ref,
        paid_at: paidAt,
      });
      toast.success('Payment recorded');
      setModalOpen(false);
      setForm(EMPTY_PAYMENT);
      setPaymentsKey((key) => key + 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to record payment'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!registration) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const eventId = relatedId(registration, 'event', 'event_id');
  const alumniId = relatedId(registration, 'alumni', 'alumni_id');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/alumni/event-registrations"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to registrations
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Registration #{id}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm">
          {eventId && (
            <Link to={`/alumni/events/${eventId}`} className="text-blue-600 hover:underline">
              View event
            </Link>
          )}
          {alumniId && (
            <Link to={`/alumni/profiles/${alumniId}`} className="text-blue-600 hover:underline">
              View alumni profile
            </Link>
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={registration} emptyMessage="No details available" />
      </Card>

      <Card className="border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Payments</h2>
          {can('create') && (
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
        <RecordPanel key={paymentsKey} load={loadPayments} emptyMessage="No payments recorded yet" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => !submitting && setModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                Amount *
              </label>
              <input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="500"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="payment_mode" className="block text-sm font-medium text-slate-700 mb-1">
                Payment Mode *
              </label>
              <select
                id="payment_mode"
                value={form.payment_mode}
                onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
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
              <label htmlFor="transaction_ref" className="block text-sm font-medium text-slate-700 mb-1">
                Transaction Reference *
              </label>
              <input
                id="transaction_ref"
                type="text"
                value={form.transaction_ref}
                onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
                placeholder="UPI-8842931"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="paid_at" className="block text-sm font-medium text-slate-700 mb-1">
                Paid At
              </label>
              <input
                id="paid_at"
                type="datetime-local"
                value={form.paid_at}
                onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getSubscriptionPayments, createSubscriptionPayment } from '../../api/fees.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportFeePayment, TransportFeePaymentFormData, TransportFeeSubscription } from '../../types/fee.types';

interface SubscriptionPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: TransportFeeSubscription | null;
}

const emptyForm: TransportFeePaymentFormData = {
  amount_paid: 0,
  payment_date: '',
  payment_mode: '',
  transaction_ref: '',
  invoice_id: '',
};

export default function SubscriptionPaymentsModal({ isOpen, onClose, subscription }: SubscriptionPaymentsModalProps) {
  const [payments, setPayments] = useState<TransportFeePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TransportFeePaymentFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && subscription) {
      setShowForm(false);
      setFormData(emptyForm);
      setError(null);
      loadPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subscription?.subscription_id]);

  async function loadPayments() {
    if (!subscription) return;
    try {
      setLoading(true);
      const data = await getSubscriptionPayments(subscription.subscription_id);
      setPayments(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    if (!formData.amount_paid || !formData.payment_date || !formData.payment_mode.trim()) {
      setError('Amount, payment date, and payment mode are required.');
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      await createSubscriptionPayment(subscription.subscription_id, formData);
      setFormData(emptyForm);
      setShowForm(false);
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to record payment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subscription ? `Payments — ${subscription.fee_plan?.name ?? `Plan #${subscription.fee_plan_id}`}` : 'Payments'}
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            <Receipt className="h-4 w-4 text-slate-400" />
            Payment History
          </h4>
          {!showForm && (
            <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleAddPayment} className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid *</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.amount_paid || ''}
                  onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                  placeholder="e.g., 1500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode *</label>
                <input
                  type="text"
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  placeholder="e.g., UPI"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Ref</label>
                <input
                  type="text"
                  value={formData.transaction_ref}
                  onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
                  placeholder="e.g., TXN123456"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice ID</label>
                <input
                  type="text"
                  value={formData.invoice_id}
                  onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
                  placeholder="e.g., INV-2026-0001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Payment'}
              </Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Amount</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Mode</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Reference</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.payment_id} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-sm text-slate-600">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-sm text-slate-900 font-medium">₹{payment.amount_paid}</td>
                    <td className="py-2 px-3 text-sm text-slate-600">{payment.payment_mode}</td>
                    <td className="py-2 px-3 text-sm text-slate-600 font-mono">{payment.transaction_ref || '—'}</td>
                    <td className="py-2 px-3 text-sm text-slate-600 capitalize">{payment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

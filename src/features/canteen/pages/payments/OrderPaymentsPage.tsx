import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  CircleDollarSign,
  X,
  Receipt,
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import {
  getOrderPayments,
  createOrderPayment,
  deletePayment,
  getOrder,
  getMenuItems,
} from '../../api/canteen.api';
import type { Payment, PaymentFormData, PaymentMode, Order } from '../../types/canteen.types';

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'CARD', 'UPI', 'WALLET', 'OTHER'];

const paymentModeIcon: Record<PaymentMode, React.ElementType> = {
  CASH: Banknote,
  CARD: CreditCard,
  UPI: Smartphone,
  WALLET: Wallet,
  OTHER: CircleDollarSign,
};

const paymentModeStyles: Record<PaymentMode, string> = {
  CASH: 'bg-green-100 text-green-700',
  CARD: 'bg-blue-100 text-blue-700',
  UPI: 'bg-purple-100 text-purple-700',
  WALLET: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-slate-100 text-slate-700',
};

const defaultForm: PaymentFormData = {
  paymentMode: 'CASH',
  amount: 0,
  transactionRef: '',
};

export default function OrderPaymentsPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) loadData();
  }, [orderId]);

  async function loadData() {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const [orderData, paymentsData, menuItemsData] = await Promise.all([
        getOrder(orderId),
        getOrderPayments(orderId),
        getMenuItems(),
      ]);
      setOrder(orderData);
      setPayments(paymentsData);
      setMenuItems(menuItemsData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  const openModal = () => {
    setFormData(defaultForm);
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (!formData.amount || formData.amount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const newPayment = await createOrderPayment(orderId, {
        paymentMode: formData.paymentMode,
        amount: Number(formData.amount),
        transactionRef: formData.transactionRef?.trim() || undefined,
      });
      setPayments((prev) => [newPayment, ...prev]);
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to record payment';
      setFormError(typeof msg === 'string' ? msg : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this payment? This action cannot be undone.')) return;
    try {
      setDeletingId(id);
      await deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err instanceof Error ? err.message : 'Failed to delete payment');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPaid = Number(payments.reduce((sum, p) => sum + Number(p.amount), 0));
  
  // Use backend's totalAmount which includes taxes
  const orderTotal = Number(order?.totalAmount) ?? 0;
  const balance = Number(orderTotal - totalPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/canteen/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="text-slate-600 mt-1">
              {orderId ? (
                <>
                  Order:{' '}
                  <Link
                    to={`/canteen/orders/${orderId}`}
                    className="text-[#008BE9] hover:underline font-medium"
                  >
                    {orderId.slice(0, 8)}…
                  </Link>
                </>
              ) : (
                'Manage order payments'
              )}
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={openModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Summary cards */}
      {order && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Receipt className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Order Total</p>
                <p className="text-xl font-bold text-slate-900">₹{orderTotal.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Paid</p>
                <p className="text-xl font-bold text-green-700">₹{totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className={`border-slate-200 ${balance > 0 ? 'border-red-200' : 'border-green-200'}`}>
            <div className="p-5 flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  balance > 0 ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <CircleDollarSign
                  className={`h-5 w-5 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}
                />
              </div>
              <div>
                <p className="text-sm text-slate-500">Balance Due</p>
                <p
                  className={`text-xl font-bold ${
                    balance > 0 ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  ₹{balance.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payments table */}
      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading payments…</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Mode</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Transaction Ref</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-8 w-8 text-slate-300" />
                        <span>No payments recorded yet</span>
                        <button
                          onClick={openModal}
                          className="text-sm text-[#008BE9] hover:underline mt-1"
                        >
                          Add the first payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const ModeIcon = paymentModeIcon[payment.paymentMode] ?? CircleDollarSign;
                    return (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-slate-700">
                            {payment.id.slice(0, 8)}…
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              paymentModeStyles[payment.paymentMode] ?? 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <ModeIcon className="h-3.5 w-3.5" />
                            {payment.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          ₹{Number(payment.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-sm">
                          {payment.transactionRef || (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {new Date(payment.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(payment.id)}
                            disabled={deletingId === payment.id}
                          >
                            {deletingId === payment.id ? (
                              <span className="text-xs text-slate-400">Deleting…</span>
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl z-10">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Payment</h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {/* Payment mode */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PAYMENT_MODES.map((mode) => {
                    const Icon = paymentModeIcon[mode];
                    const isSelected = formData.paymentMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMode: mode })}
                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[#008BE9] bg-[#008BE9]/5 text-[#008BE9]'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount === 0 ? '' : formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
                {order && balance > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Balance due:{' '}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: balance })}
                      className="text-[#008BE9] hover:underline font-medium"
                    >
                      ₹{balance.toFixed(2)}
                    </button>
                  </p>
                )}
              </div>

              {/* Transaction Ref */}
              <div>
                <label
                  htmlFor="transactionRef"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Transaction Reference{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="transactionRef"
                  type="text"
                  value={formData.transactionRef ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionRef: e.target.value })
                  }
                  placeholder="e.g. UPI-TXN-99882233"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

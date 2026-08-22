import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Banknote,
  CreditCard,
  Smartphone,
  Repeat,
  CircleDollarSign,
  X,
  Wallet,
  List,
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import {
  getWallet,
  getWalletTopups,
  createWalletTopup,
} from '../../api/canteen.api';
import type { Wallet as WalletType, WalletTopup, WalletTopupFormData, TopupPaymentMode } from '../../types/canteen.types';

const PAYMENT_MODES: TopupPaymentMode[] = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'];

const modeIcon: Record<TopupPaymentMode, React.ElementType> = {
  CASH: Banknote,
  CARD: CreditCard,
  UPI: Smartphone,
  BANK_TRANSFER: Repeat,
  OTHER: CircleDollarSign,
};

const modeStyles: Record<TopupPaymentMode, string> = {
  CASH: 'bg-green-100 text-green-700',
  CARD: 'bg-blue-100 text-blue-700',
  UPI: 'bg-purple-100 text-purple-700',
  BANK_TRANSFER: 'bg-sky-100 text-sky-700',
  OTHER: 'bg-slate-100 text-slate-700',
};

const defaultForm: WalletTopupFormData = {
  amount: 0,
  paymentMode: 'CASH',
  transactionRef: '',
};

export default function WalletTopupsPage() {
  const { walletId } = useParams<{ walletId: string }>();

  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [topups, setTopups] = useState<WalletTopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add topup modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<WalletTopupFormData>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (walletId) loadData();
  }, [walletId]);

  async function loadData() {
    if (!walletId) return;
    try {
      setLoading(true);
      setError(null);
      const [walletData, topupsData] = await Promise.all([
        getWallet(walletId),
        getWalletTopups(walletId),
      ]);
      setWallet(walletData);
      setTopups(topupsData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load topups');
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
    if (!walletId) return;
    if (!formData.amount || formData.amount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      const newTopup = await createWalletTopup(walletId, {
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        transactionRef: formData.transactionRef?.trim() || undefined,
      });
      setTopups((prev) => [newTopup, ...prev]);
      // Refresh wallet balance
      const updatedWallet = await getWallet(walletId);
      setWallet(updatedWallet);
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to add topup';
      setFormError(typeof msg === 'string' ? msg : 'Failed to add topup');
    } finally {
      setSubmitting(false);
    }
  };

  const totalTopups = topups.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {wallet && (
            <Link to={`/canteen/members/${wallet.memberId}/wallet`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wallet
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Wallet Topups</h1>
            <p className="text-slate-600 mt-1">
              {walletId ? (
                <>Wallet: <span className="font-mono text-sm text-slate-700">{walletId.slice(0, 8)}…</span></>
              ) : (
                'Manage wallet top-ups'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {wallet && (
            <Link to={`/canteen/wallets/${wallet.id}/transactions`}>
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4 mr-2" />
                Ledger
              </Button>
            </Link>
          )}
          <Button variant="primary" onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topup
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {wallet && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008BE9]/10">
                <Wallet className="h-5 w-5 text-[#008BE9]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Current Balance</p>
                <p className="text-xl font-bold text-slate-900">₹{Number(wallet.balance).toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Topped Up</p>
                <p className="text-xl font-bold text-green-700">₹{totalTopups.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Repeat className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Topups</p>
                <p className="text-xl font-bold text-slate-900">{topups.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Topups table */}
      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading topups…</div>
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Topup ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Mode</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Transaction Ref</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {topups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-slate-300" />
                        <span>No topups recorded yet</span>
                        <button onClick={openModal} className="text-sm text-[#008BE9] hover:underline mt-1">
                          Add the first topup
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topups.map((topup, idx) => {
                    const ModeIcon = modeIcon[topup.paymentMode] ?? CircleDollarSign;
                    return (
                      <tr key={topup.id ?? idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-slate-700">{topup.id ? `${topup.id.slice(0, 8)}…` : '—'}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-700">
                          +₹{Number(topup.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${modeStyles[topup.paymentMode] ?? 'bg-slate-100 text-slate-700'}`}>
                            <ModeIcon className="h-3.5 w-3.5" />
                            {topup.paymentMode.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-sm">
                          {topup.transactionRef || <span className="text-slate-400 italic">—</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {new Date(topup.createdAt).toLocaleString()}
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

      {/* Add Topup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Topup</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{formError}</div>
              )}

              {/* Payment Mode selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode *</label>
                <div className="grid grid-cols-5 gap-2">
                  {PAYMENT_MODES.map((mode) => {
                    const Icon = modeIcon[mode];
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
                        <span className="text-[10px] leading-tight text-center">{mode.replace('_', '\n')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="topup-amount" className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  id="topup-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount === 0 ? '' : formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              {/* Transaction Ref */}
              <div>
                <label htmlFor="topup-ref" className="block text-sm font-medium text-slate-700 mb-1">
                  Transaction Reference <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="topup-ref"
                  type="text"
                  value={formData.transactionRef ?? ''}
                  onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                  placeholder="e.g. BANK-REF-992211"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={submitting}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Adding…' : 'Add Topup'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

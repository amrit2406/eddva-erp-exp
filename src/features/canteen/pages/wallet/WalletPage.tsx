import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  PlusCircle,
  List,
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import {
  getMemberWallet,
  createMemberWallet,
  updateWallet,
  deleteWallet,
  blockWallet,
  unblockWallet,
  getMember,
} from '../../api/canteen.api';
import type { Wallet as WalletType, CanteenMember } from '../../types/canteen.types';

export default function WalletPage() {
  const { memberId } = useParams<{ memberId: string }>();

  const [member, setMember] = useState<CanteenMember | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create wallet modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ initialBalance: 0, dailySpendLimit: 200 });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit wallet modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ dailySpendLimit: 0 });
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Block wallet modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);

  // Unblock
  const [unblocking, setUnblocking] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (memberId) loadData();
  }, [memberId]);

  async function loadData() {
    if (!memberId) return;
    try {
      setLoading(true);
      setError(null);
      const memberData = await getMember(memberId);
      setMember(memberData);
      try {
        const walletData = await getMemberWallet(memberId);
        setWallet(walletData);
      } catch (walletErr: any) {
        // 404 = no wallet yet — that's fine
        if (walletErr.response?.status !== 404) throw walletErr;
        setWallet(null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // --- Create wallet ---
  const openCreateModal = () => {
    setCreateForm({ initialBalance: 0, dailySpendLimit: 200 });
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    try {
      setCreating(true);
      setCreateError(null);
      const newWallet = await createMemberWallet(memberId, createForm);
      setWallet(newWallet);
      setShowCreateModal(false);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create wallet';
      setCreateError(typeof msg === 'string' ? msg : 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  // --- Edit wallet ---
  const openEditModal = () => {
    if (!wallet) return;
    setEditForm({ dailySpendLimit: wallet.dailySpendLimit });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    try {
      setSaving(true);
      setEditError(null);
      const updated = await updateWallet(wallet.id, { dailySpendLimit: editForm.dailySpendLimit });
      setWallet(updated);
      setShowEditModal(false);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update wallet';
      setEditError(typeof msg === 'string' ? msg : 'Failed to update wallet');
    } finally {
      setSaving(false);
    }
  };

  // --- Block wallet ---
  const openBlockModal = () => {
    setBlockReason('');
    setBlockError(null);
    setShowBlockModal(true);
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !blockReason.trim()) {
      setBlockError('Please provide a reason');
      return;
    }
    try {
      setBlocking(true);
      setBlockError(null);
      const updated = await blockWallet(wallet.id, { reason: blockReason.trim() });
      setWallet(updated);
      setShowBlockModal(false);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to block wallet';
      setBlockError(typeof msg === 'string' ? msg : 'Failed to block wallet');
    } finally {
      setBlocking(false);
    }
  };

  // --- Unblock wallet ---
  const handleUnblock = async () => {
    if (!wallet) return;
    if (!window.confirm('Unblock this wallet?')) return;
    try {
      setUnblocking(true);
      const updated = await unblockWallet(wallet.id);
      setWallet(updated);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to unblock wallet');
    } finally {
      setUnblocking(false);
    }
  };

  // --- Delete wallet ---
  const handleDelete = async () => {
    if (!wallet) return;
    if (!window.confirm('Delete this wallet? This cannot be undone.')) return;
    try {
      setDeleting(true);
      await deleteWallet(wallet.id);
      setWallet(null);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(err.response?.data?.error?.message || 'Failed to delete wallet');
    } finally {
      setDeleting(false);
    }
  };

  const isBlocked = wallet?.status === 'BLOCKED';

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>
          <p className="text-slate-600 mt-1">Member wallet management</p>
        </div>
        <Card><div className="p-8 text-center text-slate-500">Loading…</div></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/canteen/members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Members
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Wallet</h1>
            <p className="text-slate-600 mt-1">
              {member ? (
                <>Member: <span className="font-medium text-slate-800">{member.name}</span></>
              ) : (
                'Member wallet management'
              )}
            </p>
          </div>
        </div>

        {wallet && (
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/canteen/wallets/${wallet.id}/topups`}>
              <Button variant="ghost" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Topups
              </Button>
            </Link>
            <Link to={`/canteen/wallets/${wallet.id}/transactions`}>
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4 mr-2" />
                Ledger
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={openEditModal}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {isBlocked ? (
              <Button variant="secondary" size="sm" onClick={handleUnblock} disabled={unblocking}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                {unblocking ? 'Unblocking…' : 'Unblock'}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={openBlockModal}>
                <ShieldAlert className="h-4 w-4 mr-2" />
                Block
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* No wallet state */}
      {!wallet && !error && (
        <Card className="border-slate-200">
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Wallet className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">No wallet yet</p>
              <p className="text-sm text-slate-500 mt-1">
                This member doesn't have a wallet. Create one to enable digital payments.
              </p>
            </div>
            <Button variant="primary" onClick={openCreateModal}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Wallet
            </Button>
          </div>
        </Card>
      )}

      {/* Wallet details */}
      {wallet && (
        <>
          {/* Status banner */}
          {isBlocked && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Wallet Blocked</p>
                {wallet.blockedReason && (
                  <p className="text-sm text-red-600 mt-0.5">{wallet.blockedReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200">
              <div className="p-5 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#008BE9]/10">
                  <Wallet className="h-6 w-6 text-[#008BE9]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Balance</p>
                  <p className="text-2xl font-bold text-slate-900">₹{Number(wallet.balance).toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200">
              <div className="p-5 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Daily Spend Limit</p>
                  <p className="text-2xl font-bold text-slate-900">₹{Number(wallet.dailySpendLimit).toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card className={`border-slate-200 ${isBlocked ? 'border-red-200' : ''}`}>
              <div className="p-5 flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isBlocked ? 'bg-red-100' : 'bg-green-100'}`}>
                  {isBlocked ? (
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Status</p>
                  <p className={`text-lg font-bold ${isBlocked ? 'text-red-600' : 'text-green-700'}`}>
                    {wallet.status}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Details card */}
          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Wallet Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Wallet ID</dt>
                  <dd className="font-mono text-sm text-slate-800">{wallet.id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Member ID</dt>
                  <dd className="font-mono text-sm text-slate-800">{wallet.memberId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Created</dt>
                  <dd className="text-sm text-slate-700">{new Date(wallet.createdAt).toLocaleString()}</dd>
                </div>
                {wallet.updatedAt && (
                  <div>
                    <dt className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Last Updated</dt>
                    <dd className="text-sm text-slate-700">{new Date(wallet.updatedAt).toLocaleString()}</dd>
                  </div>
                )}
              </dl>

              {/* Quick actions */}
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link to={`/canteen/wallets/${wallet.id}/topups`}>
                  <Button variant="primary" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Topups
                  </Button>
                </Link>
                <Link to={`/canteen/wallets/${wallet.id}/transactions`}>
                  <Button variant="secondary" size="sm">
                    <List className="h-4 w-4 mr-2" />
                    View Ledger
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Create Wallet Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Wallet" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{createError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Balance (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={createForm.initialBalance}
              onChange={(e) => setCreateForm({ ...createForm, initialBalance: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Daily Spend Limit (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={createForm.dailySpendLimit}
              onChange={(e) => setCreateForm({ ...createForm, dailySpendLimit: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={creating}>{creating ? 'Creating…' : 'Create Wallet'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Wallet Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Wallet" size="sm">
        <form onSubmit={handleEdit} className="space-y-4">
          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{editError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Daily Spend Limit (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editForm.dailySpendLimit}
              onChange={(e) => setEditForm({ dailySpendLimit: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Block Wallet Modal */}
      <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Block Wallet" size="sm">
        <form onSubmit={handleBlock} className="space-y-4">
          {blockError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{blockError}</div>
          )}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">Blocking will prevent this wallet from being used for any transactions.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
              placeholder="e.g. Lost ID card reported by student"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent text-sm resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowBlockModal(false)} disabled={blocking}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={blocking || !blockReason.trim()}>
              {blocking ? 'Blocking…' : 'Block Wallet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

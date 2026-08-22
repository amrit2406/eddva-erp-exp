import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  List,
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getWallet, getWalletTransactions } from '../../api/canteen.api';
import type { Wallet as WalletType, WalletTransaction, WalletTransactionType } from '../../types/canteen.types';

const typeStyles: Record<WalletTransactionType, string> = {
  CREDIT: 'bg-green-100 text-green-700',
  DEBIT: 'bg-red-100 text-red-700',
};

export default function WalletTransactionsPage() {
  const { walletId } = useParams<{ walletId: string }>();

  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [filter, setFilter] = useState<'ALL' | WalletTransactionType>('ALL');

  useEffect(() => {
    if (walletId) loadData();
  }, [walletId]);

  async function loadData() {
    if (!walletId) return;
    try {
      setLoading(true);
      setError(null);
      const [walletData, txData] = await Promise.all([
        getWallet(walletId),
        getWalletTransactions(walletId),
      ]);
      setWallet(walletData);
      setTransactions(txData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);

  const totalCredits = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalDebits = transactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

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
            <h1 className="text-2xl font-bold text-slate-900">Wallet Ledger</h1>
            <p className="text-slate-600 mt-1">
              {walletId ? (
                <>Wallet: <span className="font-mono text-sm text-slate-700">{walletId.slice(0, 8)}…</span></>
              ) : (
                'Transaction history'
              )}
            </p>
          </div>
        </div>

        {wallet && (
          <Link to={`/canteen/wallets/${wallet.id}/topups`}>
            <Button variant="ghost" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Topups
            </Button>
          </Link>
        )}
      </div>

      {/* Summary cards */}
      {wallet && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008BE9]/10">
                <Wallet className="h-5 w-5 text-[#008BE9]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Balance</p>
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
                <p className="text-sm text-slate-500">Total Credits</p>
                <p className="text-xl font-bold text-green-700">₹{totalCredits.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Debits</p>
                <p className="text-xl font-bold text-red-600">₹{totalDebits.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Activity className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Transactions</p>
                <p className="text-xl font-bold text-slate-900">{transactions.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'CREDIT', 'DEBIT'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#008BE9] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'CREDIT' ? 'Credits' : 'Debits'}
            {f !== 'ALL' && (
              <span className={`ml-1.5 text-xs ${filter === f ? 'text-white/80' : 'text-slate-400'}`}>
                ({transactions.filter((t) => t.type === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Transactions table */}
      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading transactions…</div>
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance Before</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance After</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Ref ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <List className="h-8 w-8 text-slate-300" />
                        <span>No transactions found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, idx) => (
                    <tr key={tx.id ?? idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-slate-700">{tx.id ? `${tx.id.slice(0, 8)}…` : '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeStyles[tx.type]}`}>
                          {tx.type === 'CREDIT' ? (
                            <ArrowDownCircle className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpCircle className="h-3.5 w-3.5" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${tx.type === 'CREDIT' ? 'text-green-700' : 'text-red-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 text-sm">
                        ₹{Number(tx.balanceBefore).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800 font-medium text-sm">
                        ₹{Number(tx.balanceAfter).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm max-w-[200px] truncate">
                        {tx.description || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-sm">
                        {tx.referenceId ? (
                          <span className="text-xs">{tx.referenceId.slice(0, 8)}…</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {filtered.length} of {transactions.length} transactions</span>
              {filter !== 'ALL' && (
                <button onClick={() => setFilter('ALL')} className="text-[#008BE9] hover:underline text-xs">
                  Show all
                </button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Wallet, TrendingUp, List, ShieldAlert, ShieldCheck } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMembers, getMemberWallet } from '../../api/canteen.api';
import type { CanteenMember, Wallet as WalletType } from '../../types/canteen.types';

interface MemberWalletRow {
  member: CanteenMember;
  wallet: WalletType | null;
  walletLoading: boolean;
  walletError: boolean;
}

export default function WalletsPage() {
  const [rows, setRows] = useState<MemberWalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const members = await getMembers();

      // Set initial rows with loading state
      const initial: MemberWalletRow[] = members.map((m) => ({
        member: m,
        wallet: null,
        walletLoading: true,
        walletError: false,
      }));
      setRows(initial);

      // Fetch wallets individually (non-blocking)
      members.forEach(async (member, idx) => {
        try {
          const wallet = await getMemberWallet(member.id);
          setRows((prev) =>
            prev.map((r, i) =>
              i === idx ? { ...r, wallet, walletLoading: false } : r
            )
          );
        } catch (err: any) {
          setRows((prev) =>
            prev.map((r, i) =>
              i === idx
                ? { ...r, wallet: null, walletLoading: false, walletError: err.response?.status !== 404 }
                : r
            )
          );
        }
      });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wallets & Ledger</h1>
          <p className="text-slate-600 mt-1">Manage member wallets and transaction history</p>
        </div>
        <Link to="/canteen/members">
          <Button variant="ghost">
            <User className="h-4 w-4 mr-2" />
            Manage Members
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading members…</div>
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Wallet Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Daily Limit</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No members found</td>
                  </tr>
                ) : (
                  rows.map(({ member, wallet, walletLoading }) => (
                    <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{member.memberType}</td>
                      <td className="py-3 px-4">
                        {walletLoading ? (
                          <span className="text-xs text-slate-400">Loading…</span>
                        ) : wallet ? (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${wallet.status === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {wallet.status === 'BLOCKED' ? (
                              <ShieldAlert className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                            {wallet.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No wallet</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {walletLoading ? (
                          <span className="text-xs text-slate-400">…</span>
                        ) : wallet ? (
                          <span className="font-semibold text-slate-900">₹{Number(wallet.balance).toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 text-sm">
                        {walletLoading ? (
                          <span className="text-xs text-slate-400">…</span>
                        ) : wallet ? (
                          `₹${Number(wallet.dailySpendLimit).toFixed(2)}`
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/canteen/members/${member.id}/wallet`} title="Wallet">
                            <Button variant="ghost" size="sm">
                              <Wallet className="h-4 w-4 text-[#008BE9]" />
                            </Button>
                          </Link>
                          {wallet && (
                            <>
                              <Link to={`/canteen/wallets/${wallet.id}/topups`} title="Topups">
                                <Button variant="ghost" size="sm">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                </Button>
                              </Link>
                              <Link to={`/canteen/wallets/${wallet.id}/transactions`} title="Ledger">
                                <Button variant="ghost" size="sm">
                                  <List className="h-4 w-4 text-slate-500" />
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

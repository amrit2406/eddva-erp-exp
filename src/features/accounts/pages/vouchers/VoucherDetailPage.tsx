import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Send, Ban, Receipt } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CancelVoucherModal from '../../components/vouchers/CancelVoucherModal';
import { getVoucher, postVoucher, cancelVoucher } from '../../api/vouchers.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { Voucher } from '../../types/voucher.types';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  POSTED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getVoucher(id);
      setVoucher(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load voucher'));
    } finally {
      setLoading(false);
    }
  }

  const handlePost = async () => {
    if (!id || !voucher) return;
    if (!window.confirm(`Post ${voucher.voucherTypeCode} voucher ${voucher.voucherNo ?? `#${voucher.id}`}? This finalizes it in the ledger.`)) {
      return;
    }
    try {
      setPosting(true);
      const updated = await postVoucher(id);
      setVoucher(updated);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(getApiErrorMessage(err, 'Failed to post voucher'));
    } finally {
      setPosting(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!id) return;
    setCancelling(true);
    try {
      const updated = await cancelVoucher(id, { reason });
      setVoucher(updated);
      setIsCancelModalOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!voucher) {
    return <div className="text-center py-8 text-slate-500">Voucher not found.</div>;
  }

  const totalDebit = voucher.entries.reduce((sum, e) => sum + (Number(e.debitAmount) || 0), 0);
  const totalCredit = voucher.entries.reduce((sum, e) => sum + (Number(e.creditAmount) || 0), 0);

  return (
    <div className="space-y-6">
      <Link to="/accounts/vouchers" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Vouchers
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="h-6 w-6 text-slate-400" />
            {voucher.voucherTypeCode} {voucher.voucherNo ?? `#${voucher.id}`}
            <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', statusColors[voucher.status] ?? 'bg-slate-100 text-slate-600')}>
              {voucher.status}
            </span>
          </h1>
          <p className="text-slate-600 mt-1">
            {new Date(voucher.voucherDate).toLocaleDateString()}
            {voucher.referenceNo && ` · Ref: ${voucher.referenceNo}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {voucher.status === 'DRAFT' && (
            <>
              <Link to={`/accounts/vouchers/${voucher.id}/edit`}>
                <Button variant="secondary">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="primary" onClick={handlePost} disabled={posting}>
                <Send className="h-4 w-4 mr-2" />
                {posting ? 'Posting...' : 'Post'}
              </Button>
            </>
          )}
          {(voucher.status === 'DRAFT' || voucher.status === 'POSTED') && (
            <Button variant="danger" onClick={() => setIsCancelModalOpen(true)}>
              <Ban className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {voucher.narration && (
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-600">{voucher.narration}</p>
        </Card>
      )}

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Entries</h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Account</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Cost Center</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Narration</th>
                  <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Debit</th>
                  <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Credit</th>
                </tr>
              </thead>
              <tbody>
                {voucher.entries.map((entry, i) => (
                  <tr key={entry.id ?? i} className="border-b border-slate-100">
                    <td className="py-2 px-4 text-sm text-slate-900">
                      {entry.account ? `${entry.account.accountCode} — ${entry.account.accountName}` : entry.accountId}
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-600">{entry.costCenter?.name ?? '—'}</td>
                    <td className="py-2 px-4 text-sm text-slate-600">{entry.narration || '—'}</td>
                    <td className="py-2 px-4 text-sm text-slate-900 text-right">
                      {entry.debitAmount ? `₹${Number(entry.debitAmount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2 px-4 text-sm text-slate-900 text-right">
                      {entry.creditAmount ? `₹${Number(entry.creditAmount).toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-semibold">
                  <td colSpan={3} className="py-2 px-4 text-sm text-slate-700 text-right">
                    Total
                  </td>
                  <td className="py-2 px-4 text-sm text-slate-900 text-right">₹{totalDebit.toFixed(2)}</td>
                  <td className="py-2 px-4 text-sm text-slate-900 text-right">₹{totalCredit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      <CancelVoucherModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSubmit={handleCancel}
        isLoading={cancelling}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VoucherEntriesEditor from '../../components/vouchers/VoucherEntriesEditor';
import { getVoucher, updateVoucher } from '../../api/vouchers.api';
import { getLedgerAccounts } from '../../api/coa.api';
import { getCostCenters } from '../../api/costCenters.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { Voucher, VoucherEntryFormData } from '../../types/voucher.types';
import type { LedgerAccount } from '../../types/coa.types';
import type { CostCenter } from '../../types/costCenter.types';

export default function EditVoucherPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [entries, setEntries] = useState<VoucherEntryFormData[]>([]);
  const [header, setHeader] = useState({ voucherDate: '', narration: '', referenceNo: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [voucherData, accountData, costCenterData] = await Promise.all([
        getVoucher(id),
        getLedgerAccounts(),
        getCostCenters(),
      ]);
      setVoucher(voucherData);
      setAccounts(accountData);
      setCostCenters(costCenterData);
      setHeader({
        voucherDate: voucherData.voucherDate.slice(0, 10),
        narration: voucherData.narration ?? '',
        referenceNo: voucherData.referenceNo ?? '',
      });
      setEntries(
        voucherData.entries.map((en) => ({
          accountId: en.accountId,
          debitAmount: Number(en.debitAmount) || 0,
          creditAmount: Number(en.creditAmount) || 0,
          costCenterId: en.costCenterId ?? '',
          narration: en.narration ?? '',
        }))
      );
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load voucher'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const validEntries = entries.filter((en) => en.accountId && (en.debitAmount > 0 || en.creditAmount > 0));
    if (validEntries.length < 2) {
      setError('Add at least two valid entries with an account and a debit or credit amount.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await updateVoucher(id, { ...header, entries: validEntries });
      navigate(`/accounts/vouchers/${id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update voucher'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!voucher) {
    return <div className="text-center py-8 text-slate-500">Voucher not found.</div>;
  }

  if (voucher.status !== 'DRAFT') {
    return (
      <div className="space-y-6">
        <Link to={`/accounts/vouchers/${voucher.id}`} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to Voucher
        </Link>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">
            This voucher is {voucher.status.toLowerCase()} and can no longer be edited.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Voucher</h1>
        <p className="text-slate-600 mt-1">
          {voucher.voucherType?.code ?? ''} voucher {voucher.voucherNumber}
        </p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Voucher Date *</label>
                <input
                  type="date"
                  value={header.voucherDate}
                  onChange={(e) => setHeader({ ...header, voucherDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
                <input
                  type="text"
                  value={header.referenceNo}
                  onChange={(e) => setHeader({ ...header, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Narration</label>
                <textarea
                  value={header.narration}
                  onChange={(e) => setHeader({ ...header, narration: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <VoucherEntriesEditor
              entries={entries}
              onChange={setEntries}
              accounts={accounts}
              costCenters={costCenters}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/accounts/vouchers/${id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Voucher'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

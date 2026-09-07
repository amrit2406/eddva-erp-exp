import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getLedgerAccount, updateLedgerAccount, getAccountGroups } from '../../api/coa.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountGroup, LedgerAccount, LedgerAccountUpdateData } from '../../types/coa.types';

export default function EditLedgerAccountPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [openingInfo, setOpeningInfo] = useState<Pick<LedgerAccount, 'openingBalance' | 'openingBalanceType'> | null>(
    null
  );
  const [formData, setFormData] = useState<LedgerAccountUpdateData>({
    accountCode: '',
    accountName: '',
    groupId: '',
    allowVoucherEntry: true,
    isActive: true,
    isCashAccount: false,
    isBankAccount: false,
  });
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
      const [accountData, groupData] = await Promise.all([getLedgerAccount(id), getAccountGroups()]);
      setFormData({
        accountCode: accountData.accountCode,
        accountName: accountData.accountName,
        groupId: accountData.groupId,
        allowVoucherEntry: accountData.allowVoucherEntry,
        isActive: accountData.isActive,
        isCashAccount: accountData.isCashAccount,
        isBankAccount: accountData.isBankAccount,
      });
      setOpeningInfo({
        openingBalance: accountData.openingBalance,
        openingBalanceType: accountData.openingBalanceType,
      });
      setGroups(groupData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load ledger account'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateLedgerAccount(id, formData);
      navigate('/accounts/coa/ledger-accounts');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update ledger account'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Ledger Account</h1>
          <p className="text-slate-600 mt-1">Update ledger account details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Ledger Account</h1>
        <p className="text-slate-600 mt-1">Update ledger account details</p>
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
                <label htmlFor="accountCode" className="block text-sm font-medium text-slate-700 mb-1">
                  Account Code *
                </label>
                <input
                  type="text"
                  id="accountCode"
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-slate-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="groupId" className="block text-sm font-medium text-slate-700 mb-1">
                  Account Group *
                </label>
                <Select
                  id="groupId"
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
                  required
                />
              </div>

              {openingInfo && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance</label>
                  <div className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500">
                    ₹{openingInfo.openingBalance} ({openingInfo.openingBalanceType})
                    <span className="block text-xs text-slate-400 mt-0.5">Not editable after creation</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.allowVoucherEntry}
                  onChange={(e) => setFormData({ ...formData, allowVoucherEntry: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
                />
                Allow Voucher Entry
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isCashAccount}
                  onChange={(e) => setFormData({ ...formData, isCashAccount: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
                />
                Cash Account
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isBankAccount}
                  onChange={(e) => setFormData({ ...formData, isBankAccount: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
                />
                Bank Account
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/accounts/coa/ledger-accounts')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Ledger Account'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

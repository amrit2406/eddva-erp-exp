import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createLedgerAccount, getAccountGroups } from '../../api/coa.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountGroup, LedgerAccountFormData } from '../../types/coa.types';

export default function CreateLedgerAccountPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [formData, setFormData] = useState<LedgerAccountFormData>({
    accountCode: '',
    accountName: '',
    groupId: '',
    openingBalance: 0,
    openingBalanceType: 'DEBIT',
    allowVoucherEntry: true,
    isActive: true,
    isCashAccount: false,
    isBankAccount: false,
  });
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoadingGroups(true);
      const data = await getAccountGroups();
      setGroups(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
    } finally {
      setLoadingGroups(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupId) {
      setError('Please select an account group.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createLedgerAccount({
        ...formData,
        openingBalance: Number(formData.openingBalance),
      });
      navigate('/accounts/coa/ledger-accounts');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create ledger account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Ledger Account</h1>
        <p className="text-slate-600 mt-1">Create a new ledger account</p>
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
                  placeholder="e.g., CASH-001"
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
                  placeholder="e.g., Cash in Hand"
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
                  placeholder={loadingGroups ? 'Loading groups...' : 'Select a group'}
                  disabled={loadingGroups}
                  options={groups.map((g) => ({ value: g.id, label: g.groupName }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="openingBalance" className="block text-sm font-medium text-slate-700 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    id="openingBalance"
                    min={0}
                    step="0.01"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="openingBalanceType" className="block text-sm font-medium text-slate-700 mb-1">
                    Balance Type
                  </label>
                  <Select
                    id="openingBalanceType"
                    value={formData.openingBalanceType}
                    onChange={(e) =>
                      setFormData({ ...formData, openingBalanceType: e.target.value as LedgerAccountFormData['openingBalanceType'] })
                    }
                    options={[
                      { value: 'DEBIT', label: 'Debit' },
                      { value: 'CREDIT', label: 'Credit' },
                    ]}
                  />
                </div>
              </div>
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
                {submitting ? 'Creating...' : 'Create Ledger Account'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

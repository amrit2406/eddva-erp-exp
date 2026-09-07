import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import VoucherEntriesEditor from '../../components/vouchers/VoucherEntriesEditor';
import { createVoucher } from '../../api/vouchers.api';
import { getFinancialYears } from '../../api/financialYears.api';
import { getLedgerAccounts } from '../../api/coa.api';
import { getCostCenters } from '../../api/costCenters.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { VoucherFormData, VoucherEntryFormData } from '../../types/voucher.types';
import type { FinancialYear } from '../../types/financialYear.types';
import type { LedgerAccount } from '../../types/coa.types';
import type { CostCenter } from '../../types/costCenter.types';

const emptyEntries: VoucherEntryFormData[] = [
  { accountId: '', debitAmount: 0, creditAmount: 0, costCenterId: '', narration: '' },
  { accountId: '', debitAmount: 0, creditAmount: 0, costCenterId: '', narration: '' },
];

export default function CreateVoucherPage() {
  const navigate = useNavigate();
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [entries, setEntries] = useState<VoucherEntryFormData[]>(emptyEntries);
  const [header, setHeader] = useState({
    voucherTypeCode: 'PAYMENT' as VoucherFormData['voucherTypeCode'],
    fyId: '',
    voucherDate: '',
    narration: '',
    referenceNo: '',
  });
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoadingData(true);
      const [fyData, accountData, costCenterData] = await Promise.all([
        getFinancialYears(),
        getLedgerAccounts(),
        getCostCenters(),
      ]);
      setFinancialYears(fyData);
      setAccounts(accountData);
      setCostCenters(costCenterData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
    } finally {
      setLoadingData(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter((en) => en.accountId && (en.debitAmount > 0 || en.creditAmount > 0));
    if (validEntries.length < 2) {
      setError('Add at least two valid entries with an account and a debit or credit amount.');
      return;
    }
    if (!header.fyId) {
      setError('Please select a financial year.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createVoucher({
        ...header,
        entries: validEntries,
      });
      navigate('/accounts/vouchers');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create voucher'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Voucher</h1>
        <p className="text-slate-600 mt-1">Create a new accounting voucher</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="text-center py-8 text-slate-500">Loading form data...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Voucher Type *</label>
                  <Select
                    value={header.voucherTypeCode}
                    onChange={(e) =>
                      setHeader({ ...header, voucherTypeCode: e.target.value as VoucherFormData['voucherTypeCode'] })
                    }
                    options={[
                      { value: 'PAYMENT', label: 'Payment' },
                      { value: 'RECEIPT', label: 'Receipt' },
                      { value: 'JOURNAL', label: 'Journal' },
                      { value: 'CONTRA', label: 'Contra' },
                    ]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Financial Year *</label>
                  <Select
                    value={header.fyId}
                    onChange={(e) => setHeader({ ...header, fyId: e.target.value })}
                    placeholder="Select a financial year"
                    options={financialYears.map((fy) => ({ value: fy.id, label: fy.fyLabel }))}
                    required
                  />
                </div>

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
                    placeholder="e.g., CHQ-00123"
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
                  onClick={() => navigate('/accounts/vouchers')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Voucher'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

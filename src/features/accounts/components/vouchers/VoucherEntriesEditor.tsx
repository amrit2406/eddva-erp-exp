import { Plus, X } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import type { VoucherEntryFormData } from '../../types/voucher.types';
import type { LedgerAccount } from '../../types/coa.types';
import type { CostCenter } from '../../types/costCenter.types';

interface VoucherEntriesEditorProps {
  entries: VoucherEntryFormData[];
  onChange: (entries: VoucherEntryFormData[]) => void;
  accounts: LedgerAccount[];
  costCenters: CostCenter[];
}

const emptyEntry: VoucherEntryFormData = {
  accountId: '',
  debitAmount: 0,
  creditAmount: 0,
  costCenterId: '',
  narration: '',
};

export default function VoucherEntriesEditor({ entries, onChange, accounts, costCenters }: VoucherEntriesEditorProps) {
  const addEntry = () => {
    onChange([...entries, { ...emptyEntry }]);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof VoucherEntryFormData, value: string | number) => {
    const next = [...entries];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debitAmount) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.creditAmount) || 0), 0);
  const difference = totalDebit - totalCredit;
  const isBalanced = entries.length > 0 && Math.abs(difference) < 0.005;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Entries</h3>
        <Button variant="secondary" size="sm" type="button" onClick={addEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Account</label>
              <select
                value={entry.accountId}
                onChange={(e) => updateEntry(index, 'accountId', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008BE9]"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountCode} — {account.accountName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Debit</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={entry.debitAmount || ''}
                onChange={(e) => updateEntry(index, 'debitAmount', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008BE9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Credit</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={entry.creditAmount || ''}
                onChange={(e) => updateEntry(index, 'creditAmount', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008BE9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cost Center</label>
              <select
                value={entry.costCenterId ?? ''}
                onChange={(e) => updateEntry(index, 'costCenterId', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008BE9]"
              >
                <option value="">None</option>
                {costCenters.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Narration</label>
                <input
                  type="text"
                  value={entry.narration ?? ''}
                  onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#008BE9]"
                />
              </div>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="p-1.5 hover:bg-red-100 rounded text-red-600"
                  title="Remove entry"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg">
            No entries yet. Add at least two entries (one debit, one credit).
          </div>
        )}
      </div>

      <div className={cn('flex items-center justify-end gap-6 px-3 py-2 rounded-lg text-sm font-medium', isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
        <span>Total Debit: ₹{totalDebit.toFixed(2)}</span>
        <span>Total Credit: ₹{totalCredit.toFixed(2)}</span>
        <span>{isBalanced ? 'Balanced' : `Difference: ₹${Math.abs(difference).toFixed(2)}`}</span>
      </div>
    </div>
  );
}

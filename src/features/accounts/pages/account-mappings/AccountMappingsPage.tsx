import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getAccountMappings, upsertAccountMapping } from '../../api/accountMappings.api';
import { getLedgerAccounts } from '../../api/coa.api';
import { getApiErrorMessage } from '../../utils/errors';
import { MAPPING_KEYS } from '../../types/accountMapping.types';
import type { MappingKey } from '../../types/accountMapping.types';
import type { LedgerAccount } from '../../types/coa.types';

export default function AccountMappingsPage() {
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [selections, setSelections] = useState<Record<MappingKey, string>>({} as Record<MappingKey, string>);
  const [savingKey, setSavingKey] = useState<MappingKey | null>(null);
  const [savedKey, setSavedKey] = useState<MappingKey | null>(null);
  const [rowErrors, setRowErrors] = useState<Partial<Record<MappingKey, string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [accountData, mappingData] = await Promise.all([getLedgerAccounts(), getAccountMappings()]);
      setAccounts(accountData);
      const next: Record<MappingKey, string> = {} as Record<MappingKey, string>;
      for (const mapping of mappingData) {
        next[mapping.mappingKey as MappingKey] = mapping.accountId;
      }
      setSelections(next);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load account mappings'));
    } finally {
      setLoading(false);
    }
  }

  const handleSelect = (key: MappingKey, accountId: string) => {
    setSelections((prev) => ({ ...prev, [key]: accountId }));
    setSavedKey(null);
  };

  const handleSave = async (key: MappingKey) => {
    const accountId = selections[key];
    if (!accountId) {
      setRowErrors((prev) => ({ ...prev, [key]: 'Select an account first.' }));
      return;
    }
    try {
      setSavingKey(key);
      setRowErrors((prev) => ({ ...prev, [key]: undefined }));
      await upsertAccountMapping({ mappingKey: key, accountId });
      setSavedKey(key);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setRowErrors((prev) => ({ ...prev, [key]: getApiErrorMessage(err, 'Failed to save mapping') }));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Mappings</h1>
        <p className="text-slate-600 mt-1">
          Configure the ledger accounts used when other modules auto-post vouchers
        </p>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="divide-y divide-slate-100">
            {MAPPING_KEYS.map(({ key, label, description }) => (
              <div key={key} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="sm:w-64 shrink-0">
                  <p className="font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mt-1 inline-block">
                    {key}
                  </code>
                </div>
                <div className="flex-1 min-w-[240px]">
                  <Select
                    value={selections[key] ?? ''}
                    onChange={(e) => handleSelect(key, e.target.value)}
                    placeholder="Select a ledger account"
                    options={accounts.map((a) => ({ value: a.id, label: `${a.accountCode} — ${a.accountName}` }))}
                  />
                  {rowErrors[key] && <p className="text-xs text-red-600 mt-1">{rowErrors[key]}</p>}
                </div>
                <Button
                  variant={savedKey === key ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleSave(key)}
                  disabled={savingKey === key}
                >
                  {savingKey === key ? (
                    'Saving...'
                  ) : savedKey === key ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

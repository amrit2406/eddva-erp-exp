import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import LedgerAccountTable from '../../components/coa/LedgerAccountTable';
import { getLedgerAccounts } from '../../api/coa.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { LedgerAccount } from '../../types/coa.types';

export default function LedgerAccountsPage() {
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await getLedgerAccounts();
      setAccounts(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load ledger accounts'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ledger Accounts</h1>
          <p className="text-slate-600 mt-1">Manage individual ledger accounts under the chart of accounts</p>
        </div>
        <Link to="/accounts/coa/ledger-accounts/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Ledger Account
          </Button>
        </Link>
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
          <LedgerAccountTable accounts={accounts} />
        </Card>
      )}
    </div>
  );
}

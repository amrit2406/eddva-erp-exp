import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccountGroupTable from '../../components/coa/AccountGroupTable';
import { getAccountGroups } from '../../api/coa.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { AccountGroup } from '../../types/coa.types';

export default function AccountGroupsPage() {
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      const data = await getAccountGroups();
      setGroups(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load account groups'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Groups</h1>
          <p className="text-slate-600 mt-1">Manage the chart of accounts group hierarchy</p>
        </div>
        <Link to="/accounts/coa/groups/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Group
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
          <AccountGroupTable groups={groups} />
        </Card>
      )}
    </div>
  );
}

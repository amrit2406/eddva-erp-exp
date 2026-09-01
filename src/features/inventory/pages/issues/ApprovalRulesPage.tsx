import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import IssuesTabs from '../../components/issues/IssuesTabs';
import ApprovalRuleTable from '../../components/issues/ApprovalRuleTable';
import { getApprovalRules } from '../../api/issues.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryApprovalRule } from '../../types/issue.types';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<InventoryApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await getApprovalRules();
      setRules(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load approval rules'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issues & Returns</h1>
          <p className="text-slate-600 mt-1">Issue stock/assets to holders and process approvals and returns</p>
        </div>
        <Link to="/inventory/issues/approval-rules/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Approval Rule
          </Button>
        </Link>
      </div>

      <IssuesTabs />

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <ApprovalRuleTable rules={rules} />
        )}
      </Card>
    </div>
  );
}

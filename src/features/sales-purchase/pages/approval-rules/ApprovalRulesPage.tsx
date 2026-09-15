import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ApprovalRuleTable from '../../components/approval-rules/ApprovalRuleTable';
import { getApprovalRules, deleteApprovalRule } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { ApprovalRule } from '../../types/sales-purchase.types';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
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
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load approval rules'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this approval rule?')) {
      return;
    }
    try {
      await deleteApprovalRule(id);
      setRules(rules.filter((r) => r.rule_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete approval rule'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PO Approval Rules</h1>
          <p className="text-slate-600 mt-1">Configure purchase order amount thresholds and required approvers</p>
        </div>
        <Link to="/sales-purchase/approval-rules/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Approval Rule
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <ApprovalRuleTable rules={rules} onDelete={handleDelete} />
        )}
      </Card>
    </div>
  );
}

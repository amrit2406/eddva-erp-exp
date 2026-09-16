import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Shield, IndianRupee, Calendar, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getApprovalRule } from '../../api/sales-purchase.api';
import { cn } from '../../../../utils/cn';
import type { ApprovalRule } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function ApprovalRuleDetailsPage() {
  const { id } = useParams();
  const [rule, setRule] = useState<ApprovalRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRule(id);
    }
  }, [id]);

  async function loadRule(ruleId: string) {
    try {
      setLoading(true);
      const data = await getApprovalRule(ruleId);
      setRule(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load approval rule'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/approval-rules">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Approval Rule Details</h1>
          <p className="text-slate-600 mt-1">View PO approval rule information</p>
        </div>
        <Link to={`/sales-purchase/approval-rules/${id}/edit`}>
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
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
      ) : rule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Rule Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Rule Name</label>
                  <p className="mt-1 text-lg font-medium text-slate-900">{rule.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Amount Range</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">
                      {rule.min_amount ? Number(rule.min_amount).toLocaleString() : '0'}
                      {' - '}
                      {rule.max_amount ? Number(rule.max_amount).toLocaleString() : 'No upper limit'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Sequence</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{rule.sequence}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Approver & System Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Approver Role</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{rule.approver_role?.name || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Rule ID</label>
                  <p className="mt-1 text-slate-900">{rule.rule_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{rule.created_at ? new Date(rule.created_at).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

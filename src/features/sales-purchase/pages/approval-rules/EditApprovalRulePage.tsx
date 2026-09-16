import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ApprovalRuleForm from '../../components/approval-rules/ApprovalRuleForm';
import { getApprovalRule, updateApprovalRule } from '../../api/sales-purchase.api';
import { getRoles } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { ApprovalRuleFormData, Role } from '../../types/sales-purchase.types';

export default function EditApprovalRulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<ApprovalRuleFormData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(ruleId: string) {
    try {
      setLoading(true);
      const [data] = await Promise.all([
        getApprovalRule(ruleId),
        getRoles()
          .then(setRoles)
          .catch((err) => {
            if (err.response?.status !== 401) {
              console.error('Failed to load roles:', err);
            }
          }),
      ]);
      setDefaultValues({
        name: data.name,
        min_amount: data.min_amount ? Number(data.min_amount) : undefined,
        max_amount: data.max_amount ? Number(data.max_amount) : undefined,
        approver_role_id: data.approver_role_id || undefined,
        sequence: data.sequence,
        is_active: data.is_active,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load approval rule'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: ApprovalRuleFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await updateApprovalRule(id, data);
      navigate('/sales-purchase/approval-rules');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update approval rule'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/approval-rules">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Approval Rule</h1>
          <p className="text-slate-600 mt-1">Update PO approval rule information</p>
        </div>
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
          <div className="p-6">
            {defaultValues && (
              <ApprovalRuleForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Rule"
                roles={roles}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

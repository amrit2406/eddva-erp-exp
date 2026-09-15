import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ApprovalRuleForm from '../../components/approval-rules/ApprovalRuleForm';
import { createApprovalRule } from '../../api/sales-purchase.api';
import { getRoles } from '../../api/roles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { ApprovalRuleFormData, Role } from '../../types/sales-purchase.types';

export default function CreateApprovalRulePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch((err) => {
        if (err.response?.status !== 401) {
          console.error('Failed to load roles:', err);
        }
      });
  }, []);

  const handleSubmit = async (data: ApprovalRuleFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createApprovalRule(data);
      navigate('/sales-purchase/approval-rules');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create approval rule'));
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
          <h1 className="text-2xl font-bold text-slate-900">Add Approval Rule</h1>
          <p className="text-slate-600 mt-1">Create a new PO approval rule</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <ApprovalRuleForm
            onSubmit={handleSubmit}
            submitText="Create Rule"
            isSubmitting={isSubmitting}
            roles={roles}
          />
        </div>
      </Card>
    </div>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import ApprovalRuleForm from '../../components/approval-rules/ApprovalRuleForm';
import { getApprovalRule, updateApprovalRule } from '../../api/sales-purchase.api';
import type { ApprovalRuleFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditApprovalRulePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: rule, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'approval-rule', id], queryFn: () => getApprovalRule(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: ApprovalRuleFormData) => updateApprovalRule(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'approval-rules'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'approval-rule', id] });
      toast.success(`Rule “${data.name}” saved`);
      navigate(`/sales-purchase/approval-rules/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the rule')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: rule ? `/sales-purchase/approval-rules/${id}` : '/sales-purchase/approval-rules', label: rule?.name ?? 'Approval rules' }} title="Edit approval rule" subtitle="Applies to orders sent for approval from now on." />
      {isLoading ? (
        <FormLoading />
      ) : error || !rule ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load rule')} onRetry={() => refetch()} />
      ) : (
        <ApprovalRuleForm
          ruleId={rule.rule_id}
          defaultValues={{
            name: rule.name,
            min_amount: rule.min_amount !== null ? Number(rule.min_amount) : undefined,
            max_amount: rule.max_amount !== null ? Number(rule.max_amount) : undefined,
            approver_role_id: rule.approver_role_id ?? undefined,
            sequence: rule.sequence,
            is_active: rule.is_active,
          }}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

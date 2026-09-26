import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import ApprovalRuleForm from '../../components/approval-rules/ApprovalRuleForm';
import { createApprovalRule } from '../../api/sales-purchase.api';
import type { ApprovalRuleFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateApprovalRulePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: ApprovalRuleFormData) => createApprovalRule(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'approval-rules'] });
      toast.success(`Rule “${data.name}” added`);
      navigate('/sales-purchase/approval-rules');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the rule')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/approval-rules', label: 'Approval rules' }} title="New approval rule" subtitle="Decide who approves purchase orders in an amount range." />
      <ApprovalRuleForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add rule" />
    </div>
  );
}

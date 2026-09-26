import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import RuleForm from '../../components/membership-rules/RuleForm';
import { getMembershipRules, updateMembershipRule } from '../../api/library.api';
import type { MembershipRuleFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditMembershipRulePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: rules = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'membership-rules'], queryFn: getMembershipRules });
  const rule = rules.find((r) => r.rule_id === Number(id));

  const save = useMutation({
    mutationFn: (data: MembershipRuleFormData) => updateMembershipRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'membership-rules'] });
      toast.success('Rule saved');
      navigate('/library/membership-rules');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the rule')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/library/membership-rules', label: 'Membership rules' }} title="Edit membership rule" subtitle="New limits apply to books lent from now on." />
      {isLoading ? (
        <FormLoading blocks={3} />
      ) : error || !rule ? (
        <ErrorState message={getApiErrorMessage(error, 'Rule not found')} onRetry={() => refetch()} />
      ) : (
        <RuleForm
          defaultValues={{
            member_type: rule.member_type,
            max_books_allowed: rule.max_books_allowed,
            loan_period_days: rule.loan_period_days,
            fine_per_day: toNumber(rule.fine_per_day),
            grace_period_days: rule.grace_period_days,
            max_fine_cap: rule.max_fine_cap === null ? 0 : toNumber(rule.max_fine_cap),
          }}
          ruleId={rule.rule_id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

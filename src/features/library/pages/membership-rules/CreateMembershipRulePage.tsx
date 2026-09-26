import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import RuleForm from '../../components/membership-rules/RuleForm';
import { createMembershipRule } from '../../api/library.api';
import type { MemberType, MembershipRuleFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { MEMBER_TYPE, memberTypePlural } from '../../utils/labels';

export default function CreateMembershipRulePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const create = useMutation({
    mutationFn: (data: MembershipRuleFormData) => createMembershipRule(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'membership-rules'] });
      toast.success(`Rule for ${memberTypePlural(data.member_type).toLowerCase()} added`);
      navigate('/library/membership-rules');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the rule')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/library/membership-rules', label: 'Membership rules' }} title="New membership rule" subtitle="Set the borrowing limits for one kind of member." />
      <RuleForm
        initialType={type && type in MEMBER_TYPE ? (type as MemberType) : undefined}
        onSubmit={(data) => create.mutate(data)}
        isSubmitting={create.isPending}
        submitText="Add rule"
      />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import MemberForm from '../../components/members/MemberForm';
import { createMember } from '../../api/canteen.api';
import type { CanteenMemberFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: CanteenMemberFormData) => createMember(data),
    onSuccess: (member, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'members'] });
      toast.success(`${data.name} added`);
      navigate(member?.id ? `/canteen/members/${member.id}` : '/canteen/members');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the member')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/members', label: 'Members' }} title="New member" subtitle="Someone who can order from the canteen." />
      <MemberForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add member" />
    </div>
  );
}

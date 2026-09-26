import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import MemberForm from '../../components/members/MemberForm';
import { createMember } from '../../api/library.api';
import type { MemberFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: MemberFormData) => createMember(data),
    onSuccess: (member, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'members'] });
      toast.success(member?.library_card_number ? `${data.name} added — card ${member.library_card_number}` : `${data.name} added`);
      navigate(member?.member_id ? `/library/members/${member.member_id}` : '/library/members');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the member')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/library/members', label: 'Members' }} title="New member" subtitle="Someone who can borrow books from the library." />
      <MemberForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add member" />
    </div>
  );
}

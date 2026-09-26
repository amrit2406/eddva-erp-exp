import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import MemberForm from '../../components/members/MemberForm';
import { getMember, updateMember } from '../../api/library.api';
import type { MemberFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditMemberPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: member, isLoading, error, refetch } = useQuery({ queryKey: ['library', 'member', id], queryFn: () => getMember(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: MemberFormData) => updateMember(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'member', id] });
      toast.success(`${data.name} saved`);
      navigate(`/library/members/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the member')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: member ? `/library/members/${id}` : '/library/members', label: member?.name ?? 'Members' }} title="Edit member" subtitle={member ? `Card ${member.library_card_number}` : undefined} />
      {isLoading ? (
        <FormLoading blocks={2} />
      ) : error || !member ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load member')} onRetry={() => refetch()} />
      ) : (
        <MemberForm
          defaultValues={{ name: member.name, member_type: member.member_type, external_ref_id: member.external_ref_id ?? '', status: member.status }}
          memberId={member.member_id}
          withStatus
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

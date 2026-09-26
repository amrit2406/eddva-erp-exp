import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import MemberForm from '../../components/members/MemberForm';
import { getMember, updateMember } from '../../api/canteen.api';
import type { CanteenMemberFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditMemberPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: member, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'member', id], queryFn: () => getMember(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: CanteenMemberFormData) => updateMember(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'member', id] });
      toast.success(`${data.name} saved`);
      navigate(`/canteen/members/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the member')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: member ? `/canteen/members/${id}` : '/canteen/members', label: member?.name ?? 'Members' }} title="Edit member" />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !member ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load member')} onRetry={() => refetch()} />
      ) : (
        <MemberForm
          defaultValues={{ name: member.name, memberType: member.memberType, idCardBarcode: member.idCardBarcode, externalRefId: member.externalRefId }}
          memberId={member.id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

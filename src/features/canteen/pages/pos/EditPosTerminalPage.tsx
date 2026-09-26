import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import TerminalForm from '../../components/pos/TerminalForm';
import { getPosTerminal, updatePosTerminal } from '../../api/canteen.api';
import type { PosTerminalFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditPosTerminalPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: terminal, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'terminal', id], queryFn: () => getPosTerminal(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: PosTerminalFormData) => updatePosTerminal(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'terminals'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'terminal', id] });
      toast.success(`“${data.name}” saved`);
      navigate(`/canteen/pos/terminals/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the counter')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: terminal ? `/canteen/pos/terminals/${id}` : '/canteen/pos/terminals', label: terminal?.name ?? 'Counters' }} title="Edit counter" />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !terminal ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load counter')} onRetry={() => refetch()} />
      ) : (
        <TerminalForm
          defaultValues={{ name: terminal.name, location: terminal.location ?? '' }}
          terminalId={terminal.id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

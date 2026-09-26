import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import TerminalForm from '../../components/pos/TerminalForm';
import { createPosTerminal } from '../../api/canteen.api';
import type { PosTerminalFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreatePosTerminalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: PosTerminalFormData) => createPosTerminal(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'terminals'] });
      toast.success(`“${data.name}” added`);
      navigate('/canteen/pos/terminals');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the counter')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/pos/terminals', label: 'Counters' }} title="New counter" subtitle="A billing point where staff take orders and payments." />
      <TerminalForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add counter" />
    </div>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import ScheduleForm, { type ScheduleFormValues } from '../../components/menu/ScheduleForm';
import { getMenuSchedule, updateMenuSchedule } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditMenuSchedulePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: schedule, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'menu-schedule', id], queryFn: () => getMenuSchedule(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: ({ days, startTime, endTime }: ScheduleFormValues) => updateMenuSchedule(id, { dayOfWeek: days[0], startTime, endTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-schedule', id] });
      if (schedule) queryClient.invalidateQueries({ queryKey: ['canteen', 'item-schedules', schedule.itemId] });
      toast.success('Time slot saved');
      navigate(-1);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the time slot')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/menu/schedules', label: 'Serving times' }} title="Edit time slot" />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !schedule ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load time slot')} onRetry={() => refetch()} />
      ) : (
        <ScheduleForm
          single
          defaultValues={{ itemId: schedule.itemId, days: [schedule.dayOfWeek], startTime: schedule.startTime, endTime: schedule.endTime }}
          onSubmit={(values) => save.mutate(values)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

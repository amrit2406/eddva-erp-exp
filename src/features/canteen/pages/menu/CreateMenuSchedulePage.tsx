import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import ScheduleForm, { type ScheduleFormValues } from '../../components/menu/ScheduleForm';
import { createItemSchedule } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateMenuSchedulePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Opened from an item page: come back there afterwards.
  const [searchParams] = useSearchParams();
  const fromItem = searchParams.get('itemId') ?? '';
  const backTo = fromItem ? `/canteen/menu/items/${fromItem}` : '/canteen/menu/schedules';

  // One slot per chosen day (the API stores a single day per slot).
  const create = useMutation({
    mutationFn: async ({ itemId, days, startTime, endTime }: ScheduleFormValues) => {
      for (const dayOfWeek of days) await createItemSchedule(itemId, { dayOfWeek, startTime, endTime });
    },
    onSuccess: (_, values) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'item-schedules', values.itemId] });
      toast.success(values.days.length === 1 ? 'Time slot added' : `${values.days.length} time slots added`);
      navigate(backTo);
    },
    onError: (err) => {
      // Some days may already be saved; refresh so the list shows them.
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-items'] });
      toast.error(getApiErrorMessage(err, 'Could not add the time slot'));
    },
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: backTo, label: fromItem ? 'Menu item' : 'Serving times' }} title="New time slot" subtitle="Limit when an item can be ordered, e.g. breakfast only." />
      <ScheduleForm
        defaultValues={fromItem ? { itemId: fromItem, days: [], startTime: '', endTime: '' } : undefined}
        onSubmit={(values) => create.mutate(values)}
        isSubmitting={create.isPending}
        submitText="Add time slot"
      />
    </div>
  );
}

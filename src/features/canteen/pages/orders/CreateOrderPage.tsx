import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import OrderBuilder, { type OrderValues } from '../../components/orders/OrderBuilder';
import { createOrder, getMembers, getMenuCategories, getMenuItems, getPosTerminals, getShifts } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Opened from a member or an ID-card scan: start with that member chosen.
  const [searchParams] = useSearchParams();
  const items = useQuery({ queryKey: ['canteen', 'menu-items'], queryFn: () => getMenuItems() });
  const categories = useQuery({ queryKey: ['canteen', 'menu-categories'], queryFn: () => getMenuCategories() });
  const members = useQuery({ queryKey: ['canteen', 'members'], queryFn: () => getMembers() });
  const terminals = useQuery({ queryKey: ['canteen', 'terminals'], queryFn: () => getPosTerminals() });
  const shifts = useQuery({ queryKey: ['canteen', 'shifts'], queryFn: () => getShifts() });
  const loading = [items, categories, members, terminals, shifts].some((q) => q.isLoading);
  const failed = [items, members, terminals].find((q) => q.error);

  const create = useMutation({
    mutationFn: (v: OrderValues) =>
      createOrder({
        memberId: v.memberId,
        terminalId: v.terminalId,
        discountAmount: v.discount,
        status: 'PLACED',
        items: v.lines.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'orders'] });
      toast.success(order?.orderNumber ? `Order ${order.orderNumber} placed` : 'Order placed');
      navigate(order?.id ? `/canteen/orders/${order.id}` : '/canteen/orders');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not place the order')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/orders', label: 'Orders' }} title="New order" subtitle="Pick the items, choose the member, and place the order." />
      {loading ? (
        <FormLoading blocks={2} />
      ) : failed ? (
        <ErrorState message={getApiErrorMessage(failed.error, 'Failed to load the menu')} onRetry={() => failed.refetch()} />
      ) : (
        <OrderBuilder
          items={items.data ?? []}
          categories={[...(categories.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)}
          members={members.data ?? []}
          terminals={terminals.data ?? []}
          shifts={shifts.data ?? []}
          defaultValues={{ memberId: searchParams.get('memberId') ?? '' }}
          onSubmit={(v) => create.mutate(v)}
          onCancel={() => navigate(-1)}
          isSubmitting={create.isPending}
          submitText="Place order"
        />
      )}
    </div>
  );
}

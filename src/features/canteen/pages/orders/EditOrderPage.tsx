import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import OrderBuilder, { type OrderValues } from '../../components/orders/OrderBuilder';
import {
  addOrderItem,
  deleteOrderItem,
  getMembers,
  getMenuCategories,
  getMenuItems,
  getOrder,
  getOrderItems,
  getPosTerminals,
  getShifts,
  updateOrder,
  updateOrderItem,
} from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import { isOrderOpen, orderStatusInfo, shortRef } from '../../utils/labels';

export default function EditOrderPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const order = useQuery({ queryKey: ['canteen', 'order', id], queryFn: () => getOrder(id), enabled: Boolean(id) });
  const items = useQuery({ queryKey: ['canteen', 'menu-items'], queryFn: () => getMenuItems() });
  const categories = useQuery({ queryKey: ['canteen', 'menu-categories'], queryFn: () => getMenuCategories() });
  const members = useQuery({ queryKey: ['canteen', 'members'], queryFn: () => getMembers() });
  const terminals = useQuery({ queryKey: ['canteen', 'terminals'], queryFn: () => getPosTerminals() });
  const shifts = useQuery({ queryKey: ['canteen', 'shifts'], queryFn: () => getShifts() });
  const loading = [order, items, categories, members, terminals, shifts].some((q) => q.isLoading);
  const failed = [order, items, members, terminals].find((q) => q.error);

  // Apply basket changes line by line (the API edits order lines individually),
  // then save member, counter and discount with the final lines.
  const save = useMutation({
    mutationFn: async (v: OrderValues) => {
      const before = order.data?.items ?? [];
      for (const old of before) {
        const now = v.lines.find((l) => l.itemId === old.itemId);
        if (!now) await deleteOrderItem(id, old.id);
        else if (now.quantity !== old.quantity) await updateOrderItem(id, old.id, { quantity: now.quantity });
      }
      for (const line of v.lines) {
        if (!before.some((old) => old.itemId === line.itemId)) await addOrderItem(id, { itemId: line.itemId, quantity: line.quantity });
      }
      const saved = await getOrderItems(id);
      await updateOrder(id, {
        memberId: v.memberId,
        terminalId: v.terminalId,
        discountAmount: v.discount,
        items: saved.map((i) => ({ id: i.id, itemId: i.itemId, quantity: i.quantity })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'order', id] });
      toast.success('Order saved');
      navigate(`/canteen/orders/${id}`, { replace: true });
    },
    onError: (err) => {
      // Some lines may already have changed; reload so the page shows the truth.
      queryClient.invalidateQueries({ queryKey: ['canteen', 'order', id] });
      toast.error(getApiErrorMessage(err, 'Could not save the order'));
    },
  });

  const o = order.data;
  const title = o ? `Edit ${o.orderNumber ?? shortRef(o.id)}` : 'Edit order';

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: `/canteen/orders/${id}`, label: o?.orderNumber ?? 'Order' }} title={title} />
      {loading ? (
        <FormLoading blocks={2} />
      ) : failed || !o ? (
        <ErrorState message={getApiErrorMessage(failed?.error, 'Failed to load order')} onRetry={() => (failed ?? order).refetch()} />
      ) : !isOrderOpen(o.status) ? (
        <NextStep tone="bad">
          This order is {orderStatusInfo(o.status).label.toLowerCase()}, so it can't be changed any more.{' '}
          <Link to={`/canteen/orders/${id}`} className="font-semibold underline">
            Back to the order
          </Link>
        </NextStep>
      ) : (
        <OrderBuilder
          items={items.data ?? []}
          categories={[...(categories.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)}
          members={members.data ?? []}
          terminals={terminals.data ?? []}
          shifts={shifts.data ?? []}
          defaultValues={{
            memberId: o.memberId,
            terminalId: o.terminalId,
            discount: toNumber(o.discountAmount),
            lines: o.items.map((i) => ({ lineId: i.id, itemId: i.itemId, quantity: i.quantity })),
          }}
          onSubmit={(v) => save.mutate(v)}
          onCancel={() => navigate(`/canteen/orders/${id}`)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}

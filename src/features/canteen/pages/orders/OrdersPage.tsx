import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Eye, IndianRupee, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import ListToolbar from '../../../../components/premium/list/ListToolbar';
import PagedTable from '../../../../components/premium/list/PagedTable';
import StatusSteps, { type StatusStep } from '../../../../components/premium/list/StatusSteps';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteOrder, getOrders } from '../../api/canteen.api';
import type { Order } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { ORDER_EXITS, ORDER_FLOW, ORDER_STATUS, dateTime, isOrderOpen, orderStatusInfo, paymentStatusInfo, shortRef } from '../../utils/labels';

const KEY = ['canteen', 'orders'];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amount', label: 'Highest amount' },
  { value: 'unpaid', label: 'Not paid first' },
];

const when = (o: Order) => o.orderDate ?? o.createdAt;

function sortOrders(orders: Order[], sort: string): Order[] {
  const sorted = [...orders];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => when(a).localeCompare(when(b)));
    case 'amount':
      return sorted.sort((a, b) => toNumber(b.totalAmount) - toNumber(a.totalAmount));
    case 'unpaid':
      return sorted.sort((a, b) => Number(a.paymentStatus === 'PAID') - Number(b.paymentStatus === 'PAID') || when(b).localeCompare(when(a)));
    default:
      return sorted.sort((a, b) => when(b).localeCompare(when(a)));
  }
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Status lives in the URL so filtered views can be linked to (e.g. from the dashboard).
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const { data: orders = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => getOrders() });

  const remove = useMutation({
    mutationFn: (o: Order) => deleteOrder(o.id),
    onSuccess: (_, o) => {
      queryClient.setQueryData<Order[]>(KEY, (current) => current?.filter((x) => x.id !== o.id));
      toast.success(`${o.orderNumber ?? 'Order'} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this order')),
    onSettled: () => setPendingDelete(null),
  });

  const setStatus = (next: string | null) => {
    setPage(1);
    setSearchParams(
      (params) => {
        if (next) params.set('status', next);
        else params.delete('status');
        return params;
      },
      { replace: true },
    );
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => (map[o.status] = (map[o.status] ?? 0) + 1));
    return map;
  }, [orders]);

  const toStep = (key: string): StatusStep => ({ key, ...ORDER_STATUS[key], count: counts[key] ?? 0 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (!q) return true;
      return [o.orderNumber, o.member?.name, o.member?.idCardBarcode, o.terminal?.name].some((v) => v?.toLowerCase().includes(q));
    });
    return sortOrders(matches, sort);
  }, [orders, status, search, sort]);

  const filteredValue = filtered.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + toNumber(o.totalAmount), 0);

  const newButton = (
    <Link to="/canteen/orders/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New order
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load orders')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={ClipboardList} title="Orders" description="Food ordered at the counters, from the kitchen to collection." actions={newButton}>
        {!isLoading && orders.length > 0 && (
          <StatusSteps steps={ORDER_FLOW.map(toStep)} exits={ORDER_EXITS.map(toStep)} total={orders.length} active={status} onSelect={setStatus} />
        )}
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders yet" message="Orders taken at the counters show up here as they move from the kitchen to collection." action={newButton} />
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by order number, member or counter"
            sort={sort}
            onSort={(value) => {
              setSort(value);
              setPage(1);
            }}
            sortOptions={SORTS}
            resultLabel={`${filtered.length} order${filtered.length === 1 ? '' : 's'} · ${rupees(filteredValue)}`}
          />

          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setStatus(null);
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(o) => o.id}
              page={page}
              onPage={setPage}
              noun="orders"
              minWidth={860}
              columns={[
                {
                  header: 'Order',
                  cell: (o) => (
                    <div>
                      <Link to={`/canteen/orders/${o.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {o.orderNumber ?? shortRef(o.id)}
                      </Link>
                      <p className="text-xs text-slate-500">{dateTime(when(o))}</p>
                    </div>
                  ),
                },
                {
                  header: 'Member',
                  cell: (o) => (
                    <div>
                      <span className="text-slate-800">{o.member?.name ?? '—'}</span>
                      {o.terminal && <p className="text-xs text-slate-500">{o.terminal.name}</p>}
                    </div>
                  ),
                },
                {
                  header: 'Items',
                  cell: (o) => {
                    const names = o.items.map((i) => (i.quantity > 1 ? `${i.quantity}× ${i.item?.name ?? 'item'}` : (i.item?.name ?? 'item')));
                    return <span className="block max-w-[220px] truncate text-slate-600" title={names.join(', ')}>{names.join(', ') || '—'}</span>;
                  },
                },
                { header: 'Total', align: 'right', cell: (o) => <span className="font-medium text-slate-900">{rupees(toNumber(o.totalAmount))}</span> },
                {
                  header: 'Payment',
                  cell: (o) => {
                    if (o.status === 'CANCELLED') return <span className="text-xs text-slate-400">—</span>;
                    const p = paymentStatusInfo(o.paymentStatus);
                    return <StatusPill label={p.label} color={p.color} />;
                  },
                },
                {
                  header: 'Status',
                  cell: (o) => {
                    const s = orderStatusInfo(o.status);
                    return <StatusPill label={s.label} color={s.color} title={s.hint} />;
                  },
                },
              ]}
              actions={(o) => (
                <>
                  <IconAction icon={Eye} label="View order" to={`/canteen/orders/${o.id}`} tone="brand" />
                  <IconAction
                    icon={IndianRupee}
                    label={o.status === 'CANCELLED' ? 'Cancelled orders are not paid' : o.paymentStatus === 'PAID' ? 'Payments' : 'Take payment'}
                    to={`/canteen/orders/${o.id}/payments`}
                    disabled={o.status === 'CANCELLED'}
                  />
                  <IconAction
                    icon={Pencil}
                    label={isOrderOpen(o.status) ? 'Edit order' : `Can't edit — order is ${orderStatusInfo(o.status).label.toLowerCase()}`}
                    to={`/canteen/orders/${o.id}/edit`}
                    disabled={!isOrderOpen(o.status)}
                  />
                  <IconAction icon={Trash2} label="Delete order" tone="danger" onClick={() => setPendingDelete(o)} />
                </>
              )}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this order?"
        message={
          pendingDelete
            ? `${pendingDelete.orderNumber ?? 'This order'} for ${pendingDelete.member?.name ?? 'this member'} (${rupees(toNumber(pendingDelete.totalAmount))}) will be removed. This can't be undone${pendingDelete.paymentStatus === 'PAID' ? ' — it has already been paid, so cancelling may be better' : ''}.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete order'}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import StatusSteps, { type StatusStep } from '../../../../components/premium/list/StatusSteps';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteSalesOrder, getSalesOrders } from '../../api/sales-purchase.api';
import type { SalesOrder } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { SO_EXITS, SO_FLOW, SO_STATUS, soStatusInfo } from '../../utils/soStatus';

const KEY = ['sales-purchase', 'sales-orders'];

export default function SalesOrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<SalesOrder | null>(null);
  const { data: orders = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getSalesOrders });

  const remove = useMutation({
    mutationFn: (so: SalesOrder) => deleteSalesOrder(so.so_id),
    onSuccess: (_, so) => {
      queryClient.setQueryData<SalesOrder[]>(KEY, (current) => current?.filter((x) => x.so_id !== so.so_id));
      toast.success(`${so.so_number} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this sales order')),
    onSettled: () => setPendingDelete(null),
  });

  const setStatus = (next: string | null) => {
    setPage(1);
    setParams(
      (p) => {
        if (next) p.set('status', next);
        else p.delete('status');
        return p;
      },
      { replace: true },
    );
  };
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    orders.forEach((o) => (m[o.status] = (m[o.status] ?? 0) + 1));
    return m;
  }, [orders]);
  const toStep = (key: string): StatusStep => ({ key, ...SO_STATUS[key], count: counts[key] ?? 0 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => !status || o.status === status)
      .filter((o) => !q || [o.so_number, o.customer?.customer_name, o.customer?.customer_code].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => b.so_date.localeCompare(a.so_date) || b.so_id - a.so_id);
  }, [orders, search, status]);

  const newButton = (
    <Link to="/sales-purchase/sales-orders/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New sales order
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load sales orders')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={ClipboardList} title="Sales orders" description="What customers have agreed to buy, before it's invoiced." actions={newButton}>
        {!isLoading && orders.length > 0 && <StatusSteps steps={SO_FLOW.map(toStep)} exits={SO_EXITS.map(toStep)} total={orders.length} active={status} onSelect={setStatus} />}
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No sales orders yet" message="When a customer agrees to buy, create a sales order. Once confirmed, you can invoice it in one go or in parts." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by order number or customer"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} order{filtered.length === 1 ? '' : 's'} · {rupees(filtered.reduce((s, o) => s + toNumber(o.grand_total), 0))}
            </p>
          </div>
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
              rowKey={(o) => o.so_id}
              page={page}
              onPage={setPage}
              noun="orders"
              minWidth={760}
              columns={[
                {
                  header: 'Order no.',
                  cell: (o) => (
                    <Link to={`/sales-purchase/sales-orders/${o.so_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {o.so_number}
                    </Link>
                  ),
                },
                { header: 'Customer', cell: (o) => <span className="block max-w-[200px] truncate text-slate-700">{o.customer?.customer_name ?? '—'}</span> },
                { header: 'Ordered on', cell: (o) => <span className="whitespace-nowrap text-slate-600">{shortDate(o.so_date)}</span> },
                { header: 'Deliver by', cell: (o) => <span className="whitespace-nowrap text-slate-600">{shortDate(o.delivery_date)}</span> },
                { header: 'Amount', align: 'right', cell: (o) => <span className="font-semibold text-slate-900">{rupees(toNumber(o.grand_total))}</span> },
                {
                  header: 'Status',
                  cell: (o) => {
                    const s = soStatusInfo(o.status);
                    return <StatusPill label={s.label} color={s.color} title={s.hint} />;
                  },
                },
              ]}
              actions={(o) => {
                const draft = o.status === 'DRAFT';
                return (
                  <>
                    <IconAction icon={Eye} label="View order" to={`/sales-purchase/sales-orders/${o.so_id}`} tone="brand" />
                    <IconAction icon={Pencil} label={draft ? 'Edit order' : 'Only draft orders can be edited'} to={draft ? `/sales-purchase/sales-orders/${o.so_id}/edit` : undefined} disabled={!draft} />
                    <IconAction icon={Trash2} label={draft ? 'Delete order' : 'Only drafts can be deleted — cancel it instead'} tone="danger" onClick={() => setPendingDelete(o)} disabled={!draft} />
                  </>
                );
              }}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this sales order?"
        message={pendingDelete ? `Draft ${pendingDelete.so_number} for ${pendingDelete.customer?.customer_name ?? 'this customer'} will be removed. This can't be undone.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete order'}
      />
    </div>
  );
}

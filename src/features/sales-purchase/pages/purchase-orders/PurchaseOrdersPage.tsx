import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import ListToolbar from '../../../../components/premium/list/ListToolbar';
import Pagination from '../../../../components/premium/list/Pagination';
import StatusSteps, { type StatusStep } from '../../../../components/premium/list/StatusSteps';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import PurchaseOrderList from '../../components/purchase-orders/PurchaseOrderList';
import { deletePurchaseOrder, getPurchaseOrders } from '../../api/sales-purchase.api';
import type { PurchaseOrder } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { PO_EXITS, PO_FLOW, PO_STATUS } from '../../utils/poStatus';

const PAGE_SIZE = 10;

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amount', label: 'Highest amount' },
  { value: 'delivery', label: 'Delivery date' },
];

const time = (iso: string | null) => (iso ? new Date(iso).getTime() : Number.POSITIVE_INFINITY);

function sortOrders(orders: PurchaseOrder[], sort: string): PurchaseOrder[] {
  const sorted = [...orders];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => time(a.po_date) - time(b.po_date) || a.po_id - b.po_id);
    case 'amount':
      return sorted.sort((a, b) => toNumber(b.grand_total) - toNumber(a.grand_total));
    case 'delivery':
      return sorted.sort((a, b) => time(a.expected_delivery_date) - time(b.expected_delivery_date));
    default:
      return sorted.sort((a, b) => time(b.po_date) - time(a.po_date) || b.po_id - a.po_id);
  }
}

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Status lives in the URL so filtered views can be linked to (e.g. from the dashboard).
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PurchaseOrder | null>(null);

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'purchase-orders'],
    queryFn: getPurchaseOrders,
  });

  const remove = useMutation({
    mutationFn: (po: PurchaseOrder) => deletePurchaseOrder(po.po_id),
    onSuccess: (_, po) => {
      queryClient.setQueryData<PurchaseOrder[]>(['sales-purchase', 'purchase-orders'], (current) => current?.filter((o) => o.po_id !== po.po_id));
      toast.success(`${po.po_number} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this purchase order')),
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

  const toStep = (key: string): StatusStep => ({ key, ...PO_STATUS[key], count: counts[key] ?? 0 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (!q) return true;
      return [o.po_number, o.vendor?.vendor_name, o.vendor?.vendor_code].some((v) => v?.toLowerCase().includes(q));
    });
    return sortOrders(matches, sort);
  }, [orders, status, search, sort]);

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const filteredValue = filtered.reduce((sum, o) => sum + toNumber(o.grand_total), 0);

  const newButton = (
    <Link
      to="/sales-purchase/purchase-orders/new"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:shadow-lg hover:brightness-110"
    >
      <Plus className="h-4 w-4" /> New purchase order
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load purchase orders')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader
        icon={ShoppingCart}
        title="Purchase orders"
        description="Orders you send to vendors to buy items for the institute."
        actions={newButton}
      >
        {!isLoading && orders.length > 0 && (
          <StatusSteps
            steps={PO_FLOW.map(toStep)}
            exits={PO_EXITS.map(toStep)}
            total={orders.length}
            active={status}
            onSelect={setStatus}
          />
        )}
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchase orders yet"
          message="When you need to buy something from a vendor, create a purchase order. It goes for approval, then you receive the goods against it."
          action={newButton}
        />
      ) : (
        <>
          <ListToolbar
            search={search}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by order number or vendor"
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
            <div className="animate-rise overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
              <PurchaseOrderList purchaseOrders={filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)} onDelete={setPendingDelete} />
              <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} noun="orders" />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this purchase order?"
        message={
          pendingDelete
            ? `${pendingDelete.po_number} for ${pendingDelete.vendor?.vendor_name ?? 'this vendor'} (${rupees(toNumber(pendingDelete.grand_total))}) will be removed. This can't be undone.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete order'}
      />
    </div>
  );
}

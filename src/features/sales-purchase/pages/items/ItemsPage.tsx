import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteItem, getItems } from '../../api/sales-purchase.api';
import type { Item } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { formatRate, totalRate } from '../../utils/taxCode';

const KEY = ['sales-purchase', 'items'];

export default function ItemsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const { data: items = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getItems });

  const remove = useMutation({
    mutationFn: (i: Item) => deleteItem(i.item_id),
    onSuccess: (_, i) => {
      queryClient.setQueryData<Item[]>(KEY, (current) => current?.filter((x) => x.item_id !== i.item_id));
      toast.success(`“${i.item_name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this item')),
    onSettled: () => setPendingDelete(null),
  });

  const categories = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((i) => map.set(i.category_id, i.category?.name ?? `Category #${i.category_id}`));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => (status === 'all' ? true : status === 'INACTIVE' ? i.status === 'INACTIVE' : i.status !== 'INACTIVE'))
      .filter((i) => !category || String(i.category_id) === category)
      .filter((i) => !q || [i.item_name, i.item_code, i.hsn_sac_code].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.item_name.localeCompare(b.item_name));
  }, [items, search, status, category]);

  const reset = () => setPage(1);
  const newButton = (
    <Link to="/sales-purchase/items/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New item
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load items')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Package} title="Items" description="Everything you buy from vendors or sell to customers, with its usual price and tax." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={Package} title="No items yet" message="Add the things you buy and sell. Orders and invoices pick from this list and fill in the price and tax for you." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                reset();
              }}
              placeholder="Search by name, code or HSN"
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                reset();
              }}
              aria-label="Filter by category"
              className="rounded-2xl bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 shadow-soft ring-1 ring-slate-200/70 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All categories</option>
              {categories.map(([cid, cname]) => (
                <option key={cid} value={cid}>
                  {cname}
                </option>
              ))}
            </select>
            <Segmented
              label="Filter by status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                reset();
              }}
              options={[
                { value: 'all', label: 'All', count: items.length },
                { value: 'ACTIVE', label: 'Active', count: items.filter((i) => i.status !== 'INACTIVE').length },
                { value: 'INACTIVE', label: 'Inactive', count: items.filter((i) => i.status === 'INACTIVE').length },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setStatus('all');
                setCategory('');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(i) => i.item_id}
              page={page}
              onPage={setPage}
              noun="items"
              minWidth={860}
              columns={[
                {
                  header: 'Item',
                  cell: (i) => (
                    <>
                      <Link to={`/sales-purchase/items/${i.item_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {i.item_name}
                      </Link>
                      <p className="font-mono text-[11px] text-slate-400">{i.item_code}</p>
                    </>
                  ),
                },
                { header: 'Category', cell: (i) => <span className="text-slate-600">{i.category?.name ?? '—'}</span> },
                { header: 'Unit', cell: (i) => <span className="text-slate-600">{i.uom?.symbol ?? i.uom?.name ?? '—'}</span> },
                { header: 'Buying', align: 'right', cell: (i) => rupees(toNumber(i.purchase_price)) },
                { header: 'Selling', align: 'right', cell: (i) => <span className="font-medium text-slate-900">{rupees(toNumber(i.sales_price))}</span> },
                { header: 'Tax', cell: (i) => <span className="text-slate-600">{i.tax_code ? formatRate(totalRate(i.tax_code)) : '—'}</span> },
                { header: 'Status', cell: (i) => <StatusPill label={i.status === 'INACTIVE' ? 'Inactive' : 'Active'} color={i.status === 'INACTIVE' ? '#94a3b8' : '#15936a'} /> },
              ]}
              actions={(i) => (
                <>
                  <IconAction icon={Eye} label="View item" to={`/sales-purchase/items/${i.item_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit item" to={`/sales-purchase/items/${i.item_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete item" tone="danger" onClick={() => setPendingDelete(i)} />
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
        title="Delete this item?"
        message={pendingDelete ? `“${pendingDelete.item_name}” (${pendingDelete.item_code}) will be removed. If orders or invoices use it, the delete may be refused.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete item'}
      />
    </div>
  );
}

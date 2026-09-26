import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Star, Trash2, Warehouse as WarehouseIcon } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteWarehouse, getWarehouses } from '../../api/sales-purchase.api';
import type { Warehouse } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['sales-purchase', 'warehouses'];

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Warehouse | null>(null);
  const { data: warehouses = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getWarehouses });

  const remove = useMutation({
    mutationFn: (w: Warehouse) => deleteWarehouse(w.warehouse_id),
    onSuccess: (_, w) => {
      queryClient.setQueryData<Warehouse[]>(KEY, (current) => current?.filter((x) => x.warehouse_id !== w.warehouse_id));
      toast.success(`“${w.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this warehouse')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return warehouses
      .filter((w) => !q || w.name.toLowerCase().includes(q) || (w.address ?? '').toLowerCase().includes(q))
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.name.localeCompare(b.name));
  }, [warehouses, search]);

  const newButton = (
    <Link to="/sales-purchase/warehouses/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New warehouse
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load warehouses')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={WarehouseIcon} title="Warehouses" description="Stores where purchased goods are delivered and kept." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : warehouses.length === 0 ? (
        <EmptyState icon={WarehouseIcon} title="No warehouses yet" message="Add at least one store so purchase orders know where goods should be delivered." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name or address"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} warehouse{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(w) => w.warehouse_id}
              page={page}
              onPage={setPage}
              noun="warehouses"
              minWidth={600}
              columns={[
                {
                  header: 'Warehouse',
                  cell: (w) => (
                    <span className="inline-flex items-center gap-2">
                      <Link to={`/sales-purchase/warehouses/${w.warehouse_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {w.name}
                      </Link>
                      {w.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Star className="h-3 w-3" /> Default
                        </span>
                      )}
                    </span>
                  ),
                },
                { header: 'Address', cell: (w) => <span className="block max-w-xs truncate text-slate-600">{w.address || '—'}</span> },
                { header: 'Status', cell: (w) => <StatusPill label={w.status === 'INACTIVE' ? 'Inactive' : 'Active'} color={w.status === 'INACTIVE' ? '#94a3b8' : '#15936a'} /> },
              ]}
              actions={(w) => (
                <>
                  <IconAction icon={Eye} label="View warehouse" to={`/sales-purchase/warehouses/${w.warehouse_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit warehouse" to={`/sales-purchase/warehouses/${w.warehouse_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete warehouse" tone="danger" onClick={() => setPendingDelete(w)} />
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
        title="Delete this warehouse?"
        message={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed${pendingDelete.is_default ? '. It is your default warehouse, so set another one as default first' : ''}. If orders or receipts use it, the delete may be refused.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete warehouse'}
      />
    </div>
  );
}

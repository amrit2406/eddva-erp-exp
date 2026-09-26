import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Ruler, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteUOM, getItems, getUOMs } from '../../api/sales-purchase.api';
import type { UOM } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function UOMPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<UOM | null>(null);

  const { data: units = [], isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'uoms'], queryFn: getUOMs });
  const { data: items = [] } = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const usage = useMemo(() => {
    const map = new Map<number, number>();
    items.forEach((i) => map.set(i.uom_id, (map.get(i.uom_id) ?? 0) + 1));
    return map;
  }, [items]);

  const remove = useMutation({
    mutationFn: (u: UOM) => deleteUOM(u.uom_id),
    onSuccess: (_, u) => {
      queryClient.setQueryData<UOM[]>(['sales-purchase', 'uoms'], (current) => current?.filter((x) => x.uom_id !== u.uom_id));
      toast.success(`Unit “${u.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this unit')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u) => !q || u.name.toLowerCase().includes(q) || u.symbol.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [units, search]);

  const newButton = (
    <Link to="/sales-purchase/uom/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New unit
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load units')} onRetry={() => refetch()} />;
  const used = pendingDelete ? (usage.get(pendingDelete.uom_id) ?? 0) : 0;

  return (
    <div className="space-y-5">
      <ListHeader icon={Ruler} title="Units of measure" description="How items are counted or weighed — like piece, box or kilogram." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : units.length === 0 ? (
        <EmptyState icon={Ruler} title="No units yet" message="Add the units you buy and sell in, like Piece, Box or Kilogram. Every item needs one." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name or symbol"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} unit{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(u) => u.uom_id}
              page={page}
              onPage={setPage}
              noun="units"
              minWidth={520}
              columns={[
                {
                  header: 'Unit',
                  cell: (u) => (
                    <Link to={`/sales-purchase/uom/${u.uom_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {u.name}
                    </Link>
                  ),
                },
                { header: 'Symbol', cell: (u) => <code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">{u.symbol}</code> },
                { header: 'Used by', cell: (u) => `${usage.get(u.uom_id) ?? 0} item${(usage.get(u.uom_id) ?? 0) === 1 ? '' : 's'}` },
                { header: 'Added on', cell: (u) => <span className="whitespace-nowrap text-slate-600">{shortDate(u.created_at)}</span> },
              ]}
              actions={(u) => (
                <>
                  <IconAction icon={Eye} label="View unit" to={`/sales-purchase/uom/${u.uom_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit unit" to={`/sales-purchase/uom/${u.uom_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete unit" tone="danger" onClick={() => setPendingDelete(u)} />
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
        title="Delete this unit?"
        message={
          pendingDelete
            ? used > 0
              ? `${used} item${used === 1 ? ' is' : 's are'} measured in “${pendingDelete.name}”. Change their unit first, or the delete may be refused.`
              : `“${pendingDelete.name}” isn't used by any item and will be removed. This can't be undone.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete unit'}
      />
    </div>
  );
}

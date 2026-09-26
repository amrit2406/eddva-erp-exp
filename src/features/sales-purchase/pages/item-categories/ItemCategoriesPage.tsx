import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, Search, X } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import Pagination from '../../../../components/premium/list/Pagination';
import { useToast } from '../../../../hooks/useToast';
import ItemCategoryTable from '../../components/item-categories/ItemCategoryTable';
import { deleteItemCategory, getItemCategories, getItems } from '../../api/sales-purchase.api';
import type { ItemCategory } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

const PAGE_SIZE = 10;
type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE';

export default function ItemCategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ItemCategory | null>(null);

  const { data: categories = [], isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'item-categories'], queryFn: getItemCategories });
  // Only for the "Items" count; the list still works if this fails.
  const { data: items = [] } = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const itemCounts = useMemo(() => {
    const map = new Map<number, number>();
    items.forEach((i) => map.set(i.category_id, (map.get(i.category_id) ?? 0) + 1));
    return map;
  }, [items]);

  const remove = useMutation({
    mutationFn: (c: ItemCategory) => deleteItemCategory(c.category_id),
    onSuccess: (_, c) => {
      queryClient.setQueryData<ItemCategory[]>(['sales-purchase', 'item-categories'], (current) => current?.filter((x) => x.category_id !== c.category_id));
      toast.success(`Category “${c.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this category')),
    onSettled: () => setPendingDelete(null),
  });

  const counts = { all: categories.length, ACTIVE: categories.filter((c) => c.status !== 'INACTIVE').length, INACTIVE: categories.filter((c) => c.status === 'INACTIVE').length };
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => (status === 'all' ? true : status === 'INACTIVE' ? c.status === 'INACTIVE' : c.status !== 'INACTIVE'))
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, search, status]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  const newButton = (
    <Link
      to="/sales-purchase/item-categories/new"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110"
    >
      <Plus className="h-4 w-4" /> New category
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load item categories')} onRetry={() => refetch()} />;

  const deleteCount = pendingDelete ? (itemCounts.get(pendingDelete.category_id) ?? 0) : 0;

  return (
    <div className="space-y-5">
      <ListHeader icon={FolderTree} title="Item categories" description="Groups for your items, like Stationery or Furniture, so they're easier to find." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" message="Create a few categories first — every item you buy or sell belongs to one." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search categories"
                aria-label="Search categories"
                className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-10 text-sm shadow-soft ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="inline-flex rounded-2xl bg-white p-1 shadow-soft ring-1 ring-slate-200/70" role="group" aria-label="Filter by status">
              {(['all', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={status === s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${status === s ? 'bg-brand-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {s === 'all' ? 'All' : s === 'ACTIVE' ? 'Active' : 'Inactive'} · {counts[s]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setStatus('all');
              }}
            />
          ) : (
            <div className="animate-rise overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
              <ItemCategoryTable categories={filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)} itemCounts={itemCounts} onDelete={setPendingDelete} />
              <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} noun="categories" />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this category?"
        message={
          pendingDelete
            ? deleteCount > 0
              ? `“${pendingDelete.name}” still has ${deleteCount} item${deleteCount === 1 ? '' : 's'}. Move them to another category first, or the delete may be refused.`
              : `“${pendingDelete.name}” has no items and will be removed. This can't be undone.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete category'}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteMenuCategory, getMenuCategories } from '../../api/canteen.api';
import type { MenuCategory } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['canteen', 'menu-categories'];

export default function MenuCategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<MenuCategory | null>(null);
  const { data: categories = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => getMenuCategories() });

  const remove = useMutation({
    mutationFn: (c: MenuCategory) => deleteMenuCategory(c.id),
    onSuccess: (_, c) => {
      queryClient.setQueryData<MenuCategory[]>(KEY, (current) => current?.filter((x) => x.id !== c.id));
      toast.success(`“${c.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this category')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => !q || c.name.toLowerCase().includes(q)).sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  }, [categories, search]);

  const newButton = (
    <Link to="/canteen/menu/categories/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New category
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load categories')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={LayoutGrid} title="Menu categories" description="Groups that organise the menu, like Snacks or Beverages." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="No categories yet" message="Add a category first — every menu item belongs to one." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search categories"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(c) => c.id}
              page={page}
              onPage={setPage}
              noun="categories"
              minWidth={520}
              columns={[
                {
                  header: 'Position',
                  className: 'w-24',
                  cell: (c) => <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{c.displayOrder}</span>,
                },
                {
                  header: 'Category',
                  cell: (c) => (
                    <Link to={`/canteen/menu/categories/${c.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {c.name}
                    </Link>
                  ),
                },
                {
                  header: 'Items',
                  cell: (c) => {
                    const n = c._count?.items ?? 0;
                    return <span className={n ? 'text-slate-700' : 'text-slate-400'}>{n ? `${n} item${n === 1 ? '' : 's'}` : 'No items yet'}</span>;
                  },
                },
              ]}
              actions={(c) => (
                <>
                  <IconAction icon={Eye} label="View category" to={`/canteen/menu/categories/${c.id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit category" to={`/canteen/menu/categories/${c.id}/edit`} />
                  <IconAction icon={Trash2} label="Delete category" tone="danger" onClick={() => setPendingDelete(c)} />
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
        title="Delete this category?"
        message={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed.${pendingDelete._count?.items ? ` It still has ${pendingDelete._count.items} item${pendingDelete._count.items === 1 ? '' : 's'}, so the delete may be refused — move them first.` : ''}`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete category'}
      />
    </div>
  );
}

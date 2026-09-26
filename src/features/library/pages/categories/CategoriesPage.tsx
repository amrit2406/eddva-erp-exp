import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteCategory, getBooks, getCategories } from '../../api/library.api';
import type { Category } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['library', 'categories'];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const { data: categories = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getCategories });
  const { data: books = [] } = useQuery({ queryKey: ['library', 'books'], queryFn: getBooks });

  const remove = useMutation({
    mutationFn: (c: Category) => deleteCategory(c.category_id),
    onSuccess: (_, c) => {
      queryClient.setQueryData<Category[]>(KEY, (current) => current?.filter((x) => x.category_id !== c.category_id));
      toast.success(`“${c.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this category')),
    onSettled: () => setPendingDelete(null),
  });

  const bookCount = useMemo(() => {
    const map = new Map<number, number>();
    books.forEach((b) => map.set(b.category_id, (map.get(b.category_id) ?? 0) + 1));
    return map;
  }, [books]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => !q || c.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, search]);

  const newButton = (
    <Link to="/library/categories/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New category
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load categories')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={FolderOpen} title="Categories" description="Subjects that group the books, like Fiction or Science." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No categories yet" message="Add a category first — every book belongs to one." action={newButton} />
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
              rowKey={(c) => c.category_id}
              page={page}
              onPage={setPage}
              noun="categories"
              minWidth={480}
              columns={[
                {
                  header: 'Category',
                  cell: (c) => (
                    <Link to={`/library/categories/${c.category_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {c.name}
                    </Link>
                  ),
                },
                {
                  header: 'Books',
                  cell: (c) => {
                    const n = bookCount.get(c.category_id) ?? 0;
                    return <span className={n ? 'text-slate-700' : 'text-slate-400'}>{n ? `${n} title${n === 1 ? '' : 's'}` : 'No books yet'}</span>;
                  },
                },
              ]}
              actions={(c) => (
                <>
                  <IconAction icon={Eye} label="View category" to={`/library/categories/${c.category_id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit category" to={`/library/categories/${c.category_id}/edit`} />
                  <IconAction
                    icon={Trash2}
                    label={bookCount.get(c.category_id) ? 'Move its books to another category first' : 'Delete category'}
                    tone="danger"
                    disabled={Boolean(bookCount.get(c.category_id))}
                    onClick={() => setPendingDelete(c)}
                  />
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
        message={pendingDelete ? `“${pendingDelete.name}” will be removed. This can't be undone.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete category'}
      />
    </div>
  );
}

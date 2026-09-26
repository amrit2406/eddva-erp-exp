import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, BookPlus, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import BookCover from '../../components/books/BookCover';
import CopyScanBox from '../../components/books/CopyScanBox';
import { deleteBook, getBooks, getCategories } from '../../api/library.api';
import type { Book } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['library', 'books'];

export default function BooksPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [show, setShow] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);
  const { data: books = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getBooks });
  const { data: categories = [] } = useQuery({ queryKey: ['library', 'categories'], queryFn: getCategories });

  const remove = useMutation({
    mutationFn: (b: Book) => deleteBook(b.book_id),
    onSuccess: (_, b) => {
      queryClient.setQueryData<Book[]>(KEY, (current) => current?.filter((x) => x.book_id !== b.book_id));
      toast.success(`“${b.title}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this book')),
    onSettled: () => setPendingDelete(null),
  });

  const available = (b: Book) => b._count?.copies ?? 0;
  const onShelf = books.filter((b) => available(b) > 0).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books
      .filter((b) => (show === 'in' ? available(b) > 0 : show === 'out' ? available(b) === 0 : true))
      .filter((b) => !category || b.category_id === Number(category))
      .filter((b) => !q || [b.title, b.author, b.isbn, b.publisher].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, search, category, show]);

  const newButton = (
    <Link to="/library/books/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New book
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load books')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader
        icon={BookOpen}
        title="Books"
        description="Every title in the library and how many copies are on the shelf."
        actions={
          <>
            <CopyScanBox />
            {newButton}
          </>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books yet" message="Add a title, then add each physical copy with its barcode so it can be lent." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by title, author, ISBN or publisher"
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="rounded-2xl bg-white px-3 py-2.5 text-sm text-slate-700 shadow-soft ring-1 ring-slate-200/70 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All categories</option>
              {[...categories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <Segmented
              label="On the shelf"
              value={show}
              onChange={(v) => {
                setShow(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: books.length },
                { value: 'in', label: 'On the shelf', count: onShelf },
                { value: 'out', label: 'None free', count: books.length - onShelf },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setCategory('');
                setShow('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(b) => b.book_id}
              page={page}
              onPage={setPage}
              noun="books"
              minWidth={760}
              columns={[
                {
                  header: 'Book',
                  cell: (b) => (
                    <div className="flex items-center gap-3">
                      <BookCover src={b.cover_image_url} title={b.title} size="sm" />
                      <div className="min-w-0">
                        <Link to={`/library/books/${b.book_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                          {b.title}
                        </Link>
                        <p className="truncate text-xs text-slate-500">{b.author}</p>
                      </div>
                    </div>
                  ),
                },
                { header: 'Category', cell: (b) => <span className="text-slate-600">{b.category?.name ?? '—'}</span> },
                {
                  header: 'Published',
                  cell: (b) => (
                    <span className="text-xs text-slate-500">
                      {[b.publisher, b.publish_year].filter(Boolean).join(', ') || '—'}
                      {b.isbn && <span className="block font-mono">ISBN {b.isbn}</span>}
                    </span>
                  ),
                },
                {
                  header: 'On the shelf',
                  cell: (b) => {
                    const n = available(b);
                    return <StatusPill label={n ? `${n} free` : 'None free'} color={n ? '#15936a' : '#94a3b8'} />;
                  },
                },
              ]}
              actions={(b) => (
                <>
                  <IconAction icon={Eye} label="View book and copies" to={`/library/books/${b.book_id}`} tone="brand" />
                  <IconAction
                    icon={BookPlus}
                    label={available(b) ? 'Lend a copy' : 'No copy free to lend'}
                    to={`/library/issues/desk?bookId=${b.book_id}`}
                    disabled={!available(b)}
                  />
                  <IconAction icon={Pencil} label="Edit book" to={`/library/books/${b.book_id}/edit`} />
                  <IconAction icon={Trash2} label="Delete book" tone="danger" onClick={() => setPendingDelete(b)} />
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
        title="Delete this book?"
        message={pendingDelete ? `“${pendingDelete.title}” will be removed from the catalogue. If it has copies or loans, the delete may be refused.` : ''}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete book'}
      />
    </div>
  );
}

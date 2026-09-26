import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, FolderOpen, Pencil, Plus } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary } from '../../../../components/premium/styles';
import BookCover from '../../components/books/BookCover';
import { getBooks, getCategories } from '../../api/library.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function CategoryDetailsPage() {
  const { id = '' } = useParams();
  const { data: categories = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'categories'], queryFn: getCategories });
  const { data: books = [] } = useQuery({ queryKey: ['library', 'books'], queryFn: getBooks });
  const category = categories.find((c) => c.category_id === Number(id));

  const back = (
    <Link to="/library/categories" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Categories
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !category) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Category not found')} onRetry={() => refetch()} />
      </div>
    );
  }

  const here = books.filter((b) => b.category_id === category.category_id).sort((a, b) => a.title.localeCompare(b.title));
  const addBook = `/library/books/new?categoryId=${category.category_id}`;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={FolderOpen}
        title={category.name}
        meta={`${here.length} title${here.length === 1 ? '' : 's'} in this category`}
        actions={
          <>
            <Link to={addBook} className={btnSecondary}>
              <Plus className="h-4 w-4" /> Add book
            </Link>
            <Link to={`/library/categories/${category.category_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      />
      <InfoCard title={`Books · ${here.length}`} icon={BookOpen}>
        {here.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-2">
            <p className="text-sm text-slate-500">No books in this category yet.</p>
            <Link to={addBook} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Add the first book
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {here.map((b) => {
              const available = b._count?.copies ?? 0;
              return (
                <li key={b.book_id} className="flex items-center gap-3 py-2.5 text-sm">
                  <BookCover src={b.cover_image_url} title={b.title} size="sm" />
                  <div className="min-w-0">
                    <Link to={`/library/books/${b.book_id}`} className="font-medium text-brand-navy hover:text-brand">
                      {b.title}
                    </Link>
                    <p className="truncate text-xs text-slate-500">{b.author}</p>
                  </div>
                  <span className="ml-auto">
                    <StatusPill label={available ? `${available} on the shelf` : 'None on the shelf'} color={available ? '#15936a' : '#94a3b8'} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </InfoCard>
    </div>
  );
}

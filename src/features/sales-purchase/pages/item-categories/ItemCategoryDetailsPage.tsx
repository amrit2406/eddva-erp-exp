import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FolderTree, Pencil } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import ItemsUsingList from '../../components/items/ItemsUsingList';
import { getItemCategory, getItems } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';

const longDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

export default function ItemCategoryDetailsPage() {
  const { id = '' } = useParams();
  const { data: category, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'item-category', id],
    queryFn: () => getItemCategory(id),
    enabled: Boolean(id),
  });
  // Shared with ItemsUsingList (same query key), so this doesn't fetch twice.
  const { data: allItems = [] } = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const items = allItems.filter((i) => String(i.category_id) === id);

  const back = (
    <Link to="/sales-purchase/item-categories" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Item categories
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading">
        {back}
        <div className="skeleton h-28 rounded-3xl" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }
  if (error || !category) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load category')} onRetry={() => refetch()} />
      </div>
    );
  }

  const active = category.status !== 'INACTIVE';

  return (
    <div className="space-y-5">
      {back}

      <section className="animate-rise rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand shadow-md shadow-brand/25">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{category.name}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {items.length} item{items.length === 1 ? '' : 's'} · added {longDate(category.created_at)}
              </p>
            </div>
          </div>
          <Link
            to={`/sales-purchase/item-categories/${category.category_id}/edit`}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 sm:self-auto"
          >
            <Pencil className="h-4 w-4" /> Rename
          </Link>
        </div>
      </section>

      <ItemsUsingList title="Items in this category" filter={(i) => i.category_id === category.category_id} emptyText="No items in this category yet." />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2, Utensils } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import AvailabilitySwitch from '../../components/menu/AvailabilitySwitch';
import { FoodMark, ItemThumb } from '../../components/menu/FoodMark';
import { deleteMenuItem, getMenuCategories, getMenuItems } from '../../api/canteen.api';
import type { MenuItem } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { daysSummary } from '../../utils/labels';

const KEY = ['canteen', 'menu-items'];

export default function MenuItemsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [show, setShow] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);
  const { data: items = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => getMenuItems() });
  const { data: categories = [] } = useQuery({ queryKey: ['canteen', 'menu-categories'], queryFn: () => getMenuCategories() });

  const remove = useMutation({
    mutationFn: (item: MenuItem) => deleteMenuItem(item.id),
    onSuccess: (_, item) => {
      queryClient.setQueryData<MenuItem[]>(KEY, (current) => current?.filter((x) => x.id !== item.id));
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-categories'] });
      toast.success(`“${item.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this item')),
    onSettled: () => setPendingDelete(null),
  });

  const categoryName = (item: MenuItem) => item.category?.name ?? categories.find((c) => c.id === item.categoryId)?.name ?? '—';
  const availableCount = items.filter((i) => i.isAvailable).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => (show === 'on' ? i.isAvailable : show === 'off' ? !i.isAvailable : true))
      .filter((i) => !category || i.categoryId === category)
      .filter((i) => !q || i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, category, show]);

  const reset = () => {
    setSearch('');
    setCategory('');
    setShow('all');
    setPage(1);
  };

  const newButton = (
    <Link to="/canteen/menu/items/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New item
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load menu items')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Utensils} title="Menu items" description="Everything the canteen sells. Switch an item off when it runs out." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={Utensils} title="The menu is empty" message="Add the dishes and drinks the canteen sells so staff can put them on orders." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search items"
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
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Segmented
              label="Availability"
              value={show}
              onChange={(v) => {
                setShow(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: items.length },
                { value: 'on', label: 'Available', count: availableCount },
                { value: 'off', label: 'Off menu', count: items.length - availableCount },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={reset} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(i) => i.id}
              page={page}
              onPage={setPage}
              noun="items"
              minWidth={760}
              columns={[
                {
                  header: 'Item',
                  cell: (i) => (
                    <div className="flex items-center gap-3">
                      <ItemThumb src={i.imageUrl} alt={i.name} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FoodMark type={i.foodType} />
                          <Link to={`/canteen/menu/items/${i.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                            {i.name}
                          </Link>
                        </div>
                        {i.description && <p className="max-w-xs truncate text-xs text-slate-500">{i.description}</p>}
                      </div>
                    </div>
                  ),
                },
                { header: 'Category', cell: (i) => <span className="text-slate-600">{categoryName(i)}</span> },
                {
                  header: 'Price',
                  align: 'right',
                  cell: (i) => (
                    <div>
                      <span className="font-medium text-slate-900">{rupees(toNumber(i.price))}</span>
                      {toNumber(i.taxRate) > 0 && <span className="block text-[11px] text-slate-400">+{toNumber(i.taxRate)}% tax</span>}
                    </div>
                  ),
                },
                { header: 'Sold on', cell: (i) => <span className="text-slate-600">{daysSummary(i.availableDays ?? '')}</span> },
                { header: 'On menu', cell: (i) => <AvailabilitySwitch item={i} /> },
              ]}
              actions={(i) => (
                <>
                  <IconAction icon={Eye} label="View item" to={`/canteen/menu/items/${i.id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit item" to={`/canteen/menu/items/${i.id}/edit`} />
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
        message={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed from the menu for good. If it has been ordered before, the delete may be refused — switch it off instead.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete item'}
      />
    </div>
  );
}

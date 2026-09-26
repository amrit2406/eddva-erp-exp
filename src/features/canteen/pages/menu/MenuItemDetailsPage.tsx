import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock, ChartColumn, Pencil, Plus, Tag, Trash2, Utensils } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import AvailabilitySwitch from '../../components/menu/AvailabilitySwitch';
import { FoodMark, ItemThumb } from '../../components/menu/FoodMark';
import { deleteMenuSchedule, getItemSalesReport, getItemSchedules, getMenuCategories, getMenuItem } from '../../api/canteen.api';
import type { MenuSchedule } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { WEEK_DAYS, clockTime, dayLong, daysSummary } from '../../utils/labels';

const dayRank = (day: string) => WEEK_DAYS.findIndex((d) => d.full === day || d.code === day);

export default function MenuItemDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<MenuSchedule | null>(null);
  const { data: item, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'menu-item', id], queryFn: () => getMenuItem(id), enabled: Boolean(id) });
  const { data: categories = [] } = useQuery({ queryKey: ['canteen', 'menu-categories'], queryFn: () => getMenuCategories() });
  const schedulesKey = ['canteen', 'item-schedules', id];
  const { data: schedules = [] } = useQuery({ queryKey: schedulesKey, queryFn: () => getItemSchedules(id), enabled: Boolean(id) });
  const { data: sales = [] } = useQuery({ queryKey: ['canteen', 'report', 'item-sales', 'all'], queryFn: () => getItemSalesReport() });

  const removeSlot = useMutation({
    mutationFn: (s: MenuSchedule) => deleteMenuSchedule(s.id),
    onSuccess: (_, s) => {
      queryClient.setQueryData<MenuSchedule[]>(schedulesKey, (current) => current?.filter((x) => x.id !== s.id));
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-items'] });
      toast.success('Time slot removed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove the time slot')),
    onSettled: () => setPendingDelete(null),
  });

  const back = (
    <Link to="/canteen/menu/items" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Menu items
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !item) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load menu item')} onRetry={() => refetch()} />
      </div>
    );
  }

  const price = toNumber(item.price);
  const tax = toNumber(item.taxRate);
  const category = item.category ?? categories.find((c) => c.id === item.categoryId);
  const sold = sales.find((s) => s.itemId === item.id);
  const slots = [...schedules].sort((a, b) => dayRank(a.dayOfWeek) - dayRank(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
  const addSlot = `/canteen/menu/schedules/new?itemId=${item.id}`;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Utensils}
        title={item.name}
        status={<FoodMark type={item.foodType} withLabel />}
        meta={item.description || `Added ${longDate(item.createdAt)}`}
        actions={
          <Link to={`/canteen/menu/items/${item.id}/edit`} className={btnSecondary}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <ItemThumb src={item.imageUrl} alt={item.name} size="lg" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Member pays</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">{rupees(Math.round(price * (1 + tax / 100) * 100) / 100)}</p>
            <p className="text-xs text-slate-500">{tax > 0 ? `${rupees(price)} + ${tax}% tax` : 'No tax'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">On the menu</p>
            <AvailabilitySwitch item={item} />
          </div>
        </div>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <InfoCard
            title="Details"
            icon={Tag}
            rows={[
              ['Category', category ? <Link to={`/canteen/menu/categories/${category.id}`} className="text-brand-navy hover:text-brand">{category.name}</Link> : '—'],
              ['Sold on', daysSummary(item.availableDays ?? '')],
              ['Tax', tax > 0 ? `${tax}% GST` : 'None'],
              ['Added', longDate(item.createdAt)],
            ]}
          />
          <InfoCard
            title="Sales so far"
            icon={ChartColumn}
            delay={60}
            rows={
              sold
                ? [
                    ['Quantity sold', `${sold.quantitySold}`],
                    ['Earned', rupees(sold.totalSales)],
                  ]
                : undefined
            }
          >
            {!sold && <p className="text-sm text-slate-500">Not sold yet.</p>}
          </InfoCard>
        </div>
        <div className="lg:col-span-2">
          <InfoCard
            title="Serving times"
            icon={CalendarClock}
            delay={90}
            action={
              <Link to={addSlot} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-navy">
                <Plus className="h-4 w-4" /> Add time slot
              </Link>
            }
          >
            {slots.length === 0 ? (
              <p className="text-sm text-slate-500">No fixed times — it can be ordered any time on the days above. Add a time slot to limit it, e.g. breakfast only.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {slots.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2 text-sm">
                    <span className="w-28 font-medium text-slate-900">{dayLong(s.dayOfWeek)}</span>
                    <span className="text-slate-600">
                      {clockTime(s.startTime)} – {clockTime(s.endTime)}
                    </span>
                    <span className="ml-auto flex items-center gap-0.5">
                      <IconAction icon={Pencil} label="Edit time slot" to={`/canteen/menu/schedules/${s.id}/edit`} />
                      <IconAction icon={Trash2} label="Remove time slot" tone="danger" onClick={() => setPendingDelete(s)} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !removeSlot.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && removeSlot.mutate(pendingDelete)}
        title="Remove this time slot?"
        message={pendingDelete ? `${item.name} will no longer be limited to ${dayLong(pendingDelete.dayOfWeek)}, ${clockTime(pendingDelete.startTime)} – ${clockTime(pendingDelete.endTime)}.` : ''}
        confirmText={removeSlot.isPending ? 'Removing…' : 'Remove slot'}
      />
    </div>
  );
}

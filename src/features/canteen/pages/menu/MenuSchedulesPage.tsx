import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { FoodMark } from '../../components/menu/FoodMark';
import { deleteMenuSchedule, getMenuItems } from '../../api/canteen.api';
import type { MenuItem, MenuSchedule } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { WEEK_DAYS, clockTime, dayLong } from '../../utils/labels';

type Slot = MenuSchedule & { item: MenuItem };

const dayRank = (day: string) => WEEK_DAYS.findIndex((d) => d.full === day || d.code === day);

export default function MenuSchedulesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [day, setDay] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Slot | null>(null);
  // Menu items already carry their time slots, so one request covers the page.
  const { data: items = [], isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'menu-items'], queryFn: () => getMenuItems() });

  const remove = useMutation({
    mutationFn: (s: Slot) => deleteMenuSchedule(s.id),
    onSuccess: (_, s) => {
      queryClient.setQueryData<MenuItem[]>(['canteen', 'menu-items'], (current) =>
        current?.map((i) => (i.id === s.itemId ? { ...i, schedules: i.schedules?.filter((x) => x.id !== s.id) } : i)),
      );
      queryClient.invalidateQueries({ queryKey: ['canteen', 'item-schedules', s.itemId] });
      toast.success('Time slot removed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove the time slot')),
    onSettled: () => setPendingDelete(null),
  });

  const slots = useMemo<Slot[]>(() => items.flatMap((item) => (item.schedules ?? []).map((s) => ({ ...s, item }))), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return slots
      .filter((s) => !day || s.dayOfWeek === day)
      .filter((s) => !q || s.item.name.toLowerCase().includes(q))
      .sort((a, b) => dayRank(a.dayOfWeek) - dayRank(b.dayOfWeek) || a.startTime.localeCompare(b.startTime) || a.item.name.localeCompare(b.item.name));
  }, [slots, search, day]);

  const newButton = (
    <Link to="/canteen/menu/schedules/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New time slot
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load serving times')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader
        icon={CalendarClock}
        title="Serving times"
        description="Items with a time slot can only be ordered in that window. Items without one can be ordered all day."
        actions={newButton}
      />

      {isLoading ? (
        <ListSkeleton />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No time slots yet"
          message="Everything can be ordered all day. Add a slot to limit an item, e.g. idli only at breakfast."
          action={newButton}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by item"
            />
            <select
              value={day}
              onChange={(e) => {
                setDay(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by day"
              className="rounded-2xl bg-white px-3 py-2.5 text-sm text-slate-700 shadow-soft ring-1 ring-slate-200/70 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Every day</option>
              {WEEK_DAYS.map((d) => (
                <option key={d.full} value={d.full}>
                  {d.long}
                </option>
              ))}
            </select>
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} slot{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setDay('');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(s) => s.id}
              page={page}
              onPage={setPage}
              noun="slots"
              minWidth={560}
              columns={[
                { header: 'Day', cell: (s) => <span className="font-medium text-slate-900">{dayLong(s.dayOfWeek)}</span> },
                {
                  header: 'Time',
                  cell: (s) => (
                    <span className="text-slate-700">
                      {clockTime(s.startTime)} – {clockTime(s.endTime)}
                    </span>
                  ),
                },
                {
                  header: 'Item',
                  cell: (s) => (
                    <span className="inline-flex items-center gap-2">
                      <FoodMark type={s.item.foodType} />
                      <Link to={`/canteen/menu/items/${s.item.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {s.item.name}
                      </Link>
                    </span>
                  ),
                },
              ]}
              actions={(s) => (
                <>
                  <IconAction icon={Pencil} label="Edit time slot" to={`/canteen/menu/schedules/${s.id}/edit`} />
                  <IconAction icon={Trash2} label="Remove time slot" tone="danger" onClick={() => setPendingDelete(s)} />
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
        title="Remove this time slot?"
        message={pendingDelete ? `${pendingDelete.item.name} will no longer be limited to ${dayLong(pendingDelete.dayOfWeek)}, ${clockTime(pendingDelete.startTime)} – ${clockTime(pendingDelete.endTime)}.` : ''}
        confirmText={remove.isPending ? 'Removing…' : 'Remove slot'}
      />
    </div>
  );
}

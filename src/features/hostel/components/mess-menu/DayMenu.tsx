import { useEffect, useState } from 'react';
import GenericDataView from '../common/GenericDataView';
import { getDayMessMenu } from '../../api/hostel.api';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { WEEKDAYS, capitalize, mealRank, normalizeMenuPayload, todayWeekday } from '../../utils/messMenu';
import { cn } from '../../../../utils/cn';
import type { MenuSlot, RecordResult } from '../../types/hostel.types';

interface Loaded {
  day: string;
  slots: MenuSlot[];
  raw: RecordResult;
  error?: string;
}

export default function DayMenu() {
  const [day, setDay] = useState(todayWeekday);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDayMessMenu(day)
      .then((raw) => {
        if (!cancelled) setLoaded({ day, raw, slots: normalizeMenuPayload(raw.data, day) });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) {
          setLoaded({ day, raw: { data: [] }, slots: [], error: getApiErrorMessage(err, 'Failed to load the menu') });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [day]);

  // While the stored result belongs to another day, this day is still loading.
  const current = loaded?.day === day ? loaded : null;
  const slots = [...(current?.slots ?? [])].sort((a, b) => mealRank(a.meal) - mealRank(b.meal) || a.meal.localeCompare(b.meal));
  const rawEmpty = current ? (Array.isArray(current.raw.data) ? current.raw.data.length === 0 : Object.keys(current.raw.data).length === 0) : true;

  return (
    <div>
      <div className="flex gap-2 p-4 border-b border-slate-200 overflow-x-auto">
        {WEEKDAYS.map((weekday) => (
          <button
            key={weekday}
            type="button"
            onClick={() => setDay(weekday)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              day === weekday ? 'bg-[#008BE9] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            {capitalize(weekday)}
          </button>
        ))}
      </div>

      {!current ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : current.error ? (
        <div className="p-8 text-center text-red-500">{current.error}</div>
      ) : slots.length > 0 ? (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <div key={slot.meal} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 capitalize">{slot.meal}</h3>
              {slot.items.length > 0 ? (
                <ul className="mt-2 space-y-1 text-slate-900">
                  {slot.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-slate-400">Nothing listed</p>
              )}
            </div>
          ))}
        </div>
      ) : rawEmpty ? (
        <div className="p-8 text-center text-slate-500">No menu set for {capitalize(day)}</div>
      ) : (
        <GenericDataView data={current.raw.data} emptyMessage={`No menu set for ${capitalize(day)}`} />
      )}
    </div>
  );
}

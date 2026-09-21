import { useEffect, useState } from 'react';
import GenericDataView from '../common/GenericDataView';
import { getWeeklyMessMenu } from '../../api/hostel.api';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { WEEKDAYS, capitalize, mealRank, normalizeMenuPayload, todayWeekday } from '../../utils/messMenu';
import { cn } from '../../../../utils/cn';
import type { MenuSlot, RecordResult } from '../../types/hostel.types';

interface Loaded {
  slots: MenuSlot[];
  raw: RecordResult;
}

// Days down the side, meals across the top. The one-row highlight is today.
export default function WeeklyMenu() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWeeklyMessMenu()
      .then((raw) => {
        if (!cancelled) setLoaded({ raw, slots: normalizeMenuPayload(raw.data) });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to load the weekly menu'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!loaded) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const { slots, raw } = loaded;

  if (slots.length === 0) {
    const empty = Array.isArray(raw.data) ? raw.data.length === 0 : Object.keys(raw.data).length === 0;
    // A payload we couldn't lay out as a grid is still shown rather than hidden.
    return empty ? (
      <div className="p-8 text-center text-slate-500">No menu has been set up yet</div>
    ) : (
      <GenericDataView data={raw.data} emptyMessage="No menu has been set up yet" />
    );
  }

  const meals = [...new Set(slots.map((slot) => slot.meal))].sort(
    (a, b) => mealRank(a) - mealRank(b) || a.localeCompare(b)
  );
  const today = todayWeekday();
  const itemsFor = (day: string, meal: string) =>
    slots.find((slot) => slot.day === day && slot.meal === meal)?.items ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 font-semibold text-slate-700 w-32">Day</th>
            {meals.map((meal) => (
              <th key={meal} className="text-left py-3 px-4 font-semibold text-slate-700 capitalize">
                {meal}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WEEKDAYS.map((day) => (
            <tr key={day} className={cn('border-b border-slate-100 align-top', day === today && 'bg-blue-50/60')}>
              <th scope="row" className="text-left py-3 px-4 font-medium text-slate-900">
                {capitalize(day)}
                {day === today && <span className="ml-2 text-xs font-normal text-[#008BE9]">Today</span>}
              </th>
              {meals.map((meal) => {
                const items = itemsFor(day, meal);
                return (
                  <td key={meal} className="py-3 px-4 text-sm text-slate-700">
                    {items.length > 0 ? (
                      <ul className="space-y-0.5">
                        {items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { ActiveBadge } from '../blocks/BlockBadges';
import { deleteMessMenuEntry, getMessMenu } from '../../api/hostel.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import { WEEKDAYS, capitalize, dayRank, mealRank } from '../../utils/messMenu';
import type { MessMenuEntry } from '../../types/hostel.types';

interface MenuEntriesProps {
  canUpdate: boolean;
  canDelete: boolean;
}

interface Loaded {
  key: number;
  entries: MessMenuEntry[];
  // More entries exist than were fetched.
  truncated: boolean;
  error?: string;
}

const PAGE_LIMIT = 100;

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// Every menu entry, including inactive and future-dated ones — the weekly view only
// shows what is in force. Filtering is done here because the whole set is small.
export default function MenuEntries({ canUpdate, canDelete }: MenuEntriesProps) {
  const { toast } = useToast();
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [day, setDay] = useState('');
  const [meal, setMeal] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMessMenu({ limit: PAGE_LIMIT })
      .then((result) => {
        if (cancelled) return;
        const truncated = !!result.pagination && result.pagination.total > result.data.length;
        setLoaded({ key: reloadKey, entries: result.data, truncated });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) {
          setLoaded({ key: reloadKey, entries: [], truncated: false, error: getApiErrorMessage(err, 'Failed to load menu entries') });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleDelete = async (entry: MessMenuEntry) => {
    if (!window.confirm(`Delete the ${entry.meal_type} menu for ${capitalize(entry.day_of_week)}?`)) return;
    try {
      await deleteMessMenuEntry(entry.menu_id);
      toast.success('Menu entry deleted');
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete menu entry'));
    }
  };

  if (!loaded || loaded.key !== reloadKey) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (loaded.error) return <div className="p-8 text-center text-red-500">{loaded.error}</div>;

  const meals = [...new Set(loaded.entries.map((entry) => entry.meal_type.toLowerCase()))].sort(
    (a, b) => mealRank(a) - mealRank(b) || a.localeCompare(b)
  );

  const visible = loaded.entries
    .filter((entry) => {
      if (day && entry.day_of_week.toLowerCase() !== day) return false;
      if (meal && entry.meal_type.toLowerCase() !== meal) return false;
      if (status && String(entry.is_active !== false) !== status) return false;
      return true;
    })
    .sort(
      (a, b) =>
        dayRank(a.day_of_week) - dayRank(b.day_of_week) ||
        mealRank(a.meal_type) - mealRank(b.meal_type) ||
        String(b.effective_from ?? '').localeCompare(String(a.effective_from ?? ''))
    );

  const showActions = canUpdate || canDelete;

  return (
    <div>
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <select value={day} onChange={(e) => setDay(e.target.value)} className={selectClass}>
          <option value="">All days</option>
          {WEEKDAYS.map((weekday) => (
            <option key={weekday} value={weekday}>
              {capitalize(weekday)}
            </option>
          ))}
        </select>
        <select value={meal} onChange={(e) => setMeal(e.target.value)} className={selectClass}>
          <option value="">All meals</option>
          {meals.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {loaded.truncated && (
        <p className="px-4 py-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-200">
          Showing the first {loaded.entries.length} entries only.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Day</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Meal</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Dishes</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Effective From</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
              {showActions && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="text-center py-8 text-slate-500">
                  No menu entries found
                </td>
              </tr>
            ) : (
              visible.map((entry) => (
                <tr key={entry.menu_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{capitalize(entry.day_of_week)}</td>
                  <td className="py-3 px-4 text-slate-600 capitalize">{entry.meal_type}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">{entry.items.join(', ') || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                    {formatValue('effective_from', entry.effective_from)}
                  </td>
                  <td className="py-3 px-4">
                    <ActiveBadge active={entry.is_active !== false} />
                  </td>
                  {showActions && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <Link to={`/hostel/mess-menu/${entry.menu_id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(entry)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

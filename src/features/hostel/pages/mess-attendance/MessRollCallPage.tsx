import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import BlockSelect from '../../components/blocks/BlockSelect';
import { bulkMarkMessAttendance } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { statusLabel } from '../../utils/attendance';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { MEAL_TYPES, MESS_ATTENDANCE_RESOURCE, MESS_STATUSES, defaultMeal } from '../../utils/messAttendance';
import { todayISO } from '../../utils/residents';
import { PAGE_LIMIT, fetchRows, type RowsResult } from '../../utils/rollCall';

interface Roster extends RowsResult {
  blockId: string;
  error?: string;
}

const DEFAULT_STATUS = 'opted_in';

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const STATUS_STYLES: Record<string, string> = {
  opted_in: 'bg-green-600 text-white border-green-600',
  opted_out: 'bg-slate-600 text-white border-slate-600',
  attended: 'bg-blue-600 text-white border-blue-600',
  absent: 'bg-red-600 text-white border-red-600',
};

export default function MessRollCallPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(MESS_ATTENDANCE_RESOURCE);
  const { blocks, loaded } = useBlockOptions();
  const [date, setDate] = useState(todayISO());
  const [meal, setMeal] = useState(defaultMeal());
  const [blockId, setBlockId] = useState('');
  const [roster, setRoster] = useState<Roster | null>(null);
  // Only what has been changed from the default.
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRows(blockId)
      .then((next) => {
        if (!cancelled) setRoster({ ...next, blockId });
      })
      .catch((err) => {
        if (cancelled) return;
        setRoster({
          rows: [],
          truncated: false,
          blockId,
          error: isAuthError(err) ? undefined : getApiErrorMessage(err, 'Failed to load residents'),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [blockId]);

  // While the stored roster belongs to another block, the current one is loading.
  const current = roster?.blockId === blockId ? roster : null;
  const rows = current?.rows ?? [];

  const changeBlock = (next: string) => {
    setBlockId(next);
    setStatuses({});
  };

  const statusFor = (id: number) => statuses[id] ?? DEFAULT_STATUS;
  const setAll = (status: string) => setStatuses(Object.fromEntries(rows.map((row) => [row.id, status])));
  const counts = MESS_STATUSES.map((status) => ({
    status,
    count: rows.filter((row) => statusFor(row.id) === status).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) return;
    try {
      setSubmitting(true);
      setError(null);
      await bulkMarkMessAttendance({
        meal_date: date,
        meal_type: meal,
        entries: rows.map((row) => ({ resident_id: row.id, status: statusFor(row.id) })),
      });
      toast.success(`${statusLabel(meal)} saved for ${rows.length} residents`);
      navigate('/hostel/mess-attendance');
    } catch (err) {
      // e.g. this meal was already recorded for that date
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to save meal roll call'));
    } finally {
      setSubmitting(false);
    }
  };

  const canMark = can('mark') || can('create');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/mess-attendance" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to mess attendance
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Meal Roll Call</h1>
        <p className="text-slate-600 mt-1">Mark a meal for many residents at once. Everyone starts as opted in.</p>
      </div>

      {ready && !canMark ? (
        <AccessNotice />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="border-slate-200">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
                aria-label="Date"
                required
              />
              <select value={meal} onChange={(e) => setMeal(e.target.value)} className={inputClass} aria-label="Meal">
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {statusLabel(m)}
                  </option>
                ))}
              </select>
              <BlockSelect
                id="mess_rollcall_block"
                value={blockId}
                onChange={changeBlock}
                blocks={blocks}
                loaded={loaded}
                placeholder="All residents"
                className={`${inputClass} md:w-64`}
              />
            </div>

            {error && (
              <div className="m-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {current?.error && (
              <div className="m-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {current.error}
              </div>
            )}

            {!current ? (
              <div className="p-8 text-center text-slate-500">Loading residents...</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No residents found</div>
            ) : (
              <>
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    {counts.map(({ status, count }) => (
                      <span key={status}>
                        {statusLabel(status)}: <strong className="text-slate-900">{count}</strong>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setAll('opted_in')}>
                      All opted in
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setAll('opted_out')}>
                      All opted out
                    </Button>
                  </div>
                </div>

                {current.truncated && (
                  <p className="px-4 pt-3 text-sm text-amber-700">
                    Showing the first {PAGE_LIMIT} residents. Pick a block to take the roll call for the rest.
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Resident</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100">
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900">{row.name}</p>
                            {row.admissionNo && <p className="text-xs text-slate-500">{row.admissionNo}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="inline-flex flex-wrap rounded-lg border border-slate-300 overflow-hidden">
                              {MESS_STATUSES.map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setStatuses((s) => ({ ...s, [row.id]: status }))}
                                  className={cn(
                                    'px-3 py-1.5 text-xs font-medium border-r border-slate-300 last:border-r-0 transition-colors',
                                    statusFor(row.id) === status
                                      ? STATUS_STYLES[status]
                                      : 'bg-white text-slate-600 hover:bg-slate-50'
                                  )}
                                >
                                  {statusLabel(status)}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => navigate('/hostel/mess-attendance')} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting || !date || !meal}>
                    {submitting ? 'Saving...' : `Save Roll Call (${rows.length})`}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </form>
      )}
    </div>
  );
}

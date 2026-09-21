import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import EditStatusButton from '../../components/mess-attendance/EditStatusButton';
import { getMessAttendance, getMessAttendanceSummary } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { statusLabel } from '../../utils/attendance';
import { MEAL_TYPES, MESS_ATTENDANCE_RESOURCE } from '../../utils/messAttendance';
import { todayISO } from '../../utils/residents';
import type { ListParams } from '../../types/hostel.types';

type View = 'records' | 'summary';

const VIEWS: { key: View; label: string; empty: string }[] = [
  { key: 'records', label: 'Records', empty: 'No meal attendance recorded for this selection' },
  { key: 'summary', label: 'Summary', empty: 'No meal summary for this selection' },
];

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function MessAttendancePage() {
  const { can } = useResourceAccess(MESS_ATTENDANCE_RESOURCE);
  const [view, setView] = useState<View>('records');
  const [date, setDate] = useState(todayISO());
  const [meal, setMeal] = useState('');
  // Bumped after a status edit so the visible list refetches.
  const [reloadKey, setReloadKey] = useState(0);

  const loadRecords = useCallback((params: ListParams) => getMessAttendance({ ...params, date, meal_type: meal }), [date, meal]);
  const loadSummary = useCallback(
    (params: ListParams) => getMessAttendanceSummary({ ...params, date, meal_type: meal }),
    [date, meal]
  );

  const loaders = { records: loadRecords, summary: loadSummary };
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];
  const canMark = can('mark') || can('create');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mess Attendance</h1>
          <p className="text-slate-600 mt-1">Who is having each meal, and who actually turned up</p>
        </div>
        {canMark && (
          <div className="flex flex-wrap gap-2">
            <Link to="/hostel/mess-attendance/new">
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Mark One
              </Button>
            </Link>
            <Link to="/hostel/mess-attendance/roll-call">
              <Button variant="primary">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Meal Roll Call
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                view === v.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            aria-label="Date"
          />
          <select value={meal} onChange={(e) => setMeal(e.target.value)} className={inputClass} aria-label="Meal">
            <option value="">All meals</option>
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {statusLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <RecordPanel
          key={`${view}-${date}-${meal}-${reloadKey}`}
          load={loaders[view]}
          emptyMessage={current.empty}
          rowActions={
            view === 'records' && can('update')
              ? (row) => <EditStatusButton record={row} onDone={() => setReloadKey((key) => key + 1)} />
              : undefined
          }
        />
      </Card>
    </div>
  );
}

import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import {
  getAttendance,
  getAttendanceAbsences,
  getAttendanceSummary,
} from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { ATTENDANCE_SESSIONS, statusLabel } from '../../utils/attendance';
import { recordId } from '../../utils/records';
import { todayISO } from '../../utils/residents';
import type { GenericRecord, ListParams } from '../../types/hostel.types';

type View = 'records' | 'summary' | 'absences';

const VIEWS: { key: View; label: string; empty: string }[] = [
  { key: 'records', label: 'Records', empty: 'No attendance recorded for this selection' },
  { key: 'summary', label: 'Summary', empty: 'No attendance summary for this selection' },
  { key: 'absences', label: 'Absences', empty: 'No absences for this selection' },
];

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'attendance_id');
  return id ? `/hostel/attendance/${id}` : undefined;
};

export default function AttendancePage() {
  const { can } = useResourceAccess('attendance');
  const [view, setView] = useState<View>('records');
  const [date, setDate] = useState(todayISO());
  const [session, setSession] = useState('');

  const loadRecords = useCallback((params: ListParams) => getAttendance({ ...params, date, session }), [date, session]);
  const loadSummary = useCallback((params: ListParams) => getAttendanceSummary({ ...params, date, session }), [date, session]);
  const loadAbsences = useCallback((params: ListParams) => getAttendanceAbsences({ ...params, date, session }), [date, session]);

  const loaders = { records: loadRecords, summary: loadSummary, absences: loadAbsences };
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-600 mt-1">Daily roll call for hostel residents</p>
        </div>
        {can('mark') && (
          <div className="flex flex-wrap gap-2">
            <Link to="/hostel/attendance/new">
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Mark One
              </Button>
            </Link>
            <Link to="/hostel/attendance/roll-call">
              <Button variant="primary">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Roll Call
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
          <select value={session} onChange={(e) => setSession(e.target.value)} className={inputClass} aria-label="Session">
            <option value="">All sessions</option>
            {ATTENDANCE_SESSIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        <RecordPanel
          key={`${view}-${date}-${session}`}
          load={loaders[view]}
          emptyMessage={current.empty}
          rowHref={view === 'records' ? rowHref : undefined}
        />
      </Card>
    </div>
  );
}

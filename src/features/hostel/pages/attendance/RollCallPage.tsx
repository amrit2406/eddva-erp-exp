import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import BlockSelect from '../../components/blocks/BlockSelect';
import { bulkMarkAttendance, getBlockResidents, getResidents } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { ATTENDANCE_SESSIONS, ATTENDANCE_STATUSES, defaultSession, statusLabel } from '../../utils/attendance';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { flattenRecord } from '../../utils/format';
import { relatedId } from '../../utils/records';
import { todayISO } from '../../utils/residents';
import type { GenericRecord } from '../../types/hostel.types';

interface RollCallRow {
  id: number;
  name: string;
  admissionNo: string;
}

interface Entry {
  status: string;
  remarks: string;
}

interface RowsResult {
  rows: RollCallRow[];
  truncated: boolean;
}

const PAGE_LIMIT = 200;
const DEFAULT_STATUS = 'present';

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-green-600 text-white border-green-600',
  absent: 'bg-red-600 text-white border-red-600',
  late: 'bg-amber-500 text-white border-amber-500',
  on_leave: 'bg-blue-600 text-white border-blue-600',
};

// A block's residents come back in a shape that isn't fixed yet, so pull out
// whatever identifies the resident from each row.
function toRows(data: GenericRecord | GenericRecord[]): RollCallRow[] {
  const records = Array.isArray(data) ? data : ((Object.values(data).find(Array.isArray) as GenericRecord[]) ?? []);
  return records.flatMap((record) => {
    const id = Number(relatedId(record, 'resident', 'resident_id'));
    if (!id) return [];
    const flat = flattenRecord(record);
    return [
      {
        id,
        name: String(flat.student_name ?? flat.resident_student_name ?? flat.name ?? `Resident #${id}`),
        admissionNo: String(flat.admission_no ?? flat.resident_admission_no ?? ''),
      },
    ];
  });
}

async function fetchRows(blockId: string): Promise<RowsResult> {
  if (!blockId) {
    const result = await getResidents({ limit: PAGE_LIMIT });
    return {
      rows: result.data.map((resident) => ({
        id: resident.resident_id,
        name: resident.student_name,
        admissionNo: resident.admission_no,
      })),
      truncated: (result.pagination?.total ?? 0) > result.data.length,
    };
  }
  const result = await getBlockResidents(blockId, { limit: PAGE_LIMIT });
  return { rows: toRows(result.data), truncated: (result.pagination?.total ?? 0) > PAGE_LIMIT };
}

export default function RollCallPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('attendance');
  const { blocks, loaded } = useBlockOptions();
  const [date, setDate] = useState(todayISO());
  const [session, setSession] = useState(defaultSession());
  const [blockId, setBlockId] = useState('');
  const [result, setResult] = useState<RowsResult | null>(null);
  const [entries, setEntries] = useState<Record<number, Entry>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestBlock = useRef('');

  const handleResult = (next: RowsResult, forBlock: string) => {
    if (latestBlock.current !== forBlock) return;
    setResult(next);
    setEntries({});
    setLoadError(null);
  };

  const handleLoadFailure = (err: unknown, forBlock: string) => {
    if (latestBlock.current !== forBlock) return;
    setResult({ rows: [], truncated: false });
    if (!isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load residents'));
  };

  useEffect(() => {
    fetchRows('')
      .then((next) => handleResult(next, ''))
      .catch((err) => handleLoadFailure(err, ''));
    // Initial load only; later loads happen when the block changes.
  }, []);

  const handleBlockChange = (nextBlockId: string) => {
    latestBlock.current = nextBlockId;
    setBlockId(nextBlockId);
    setResult(null);
    fetchRows(nextBlockId)
      .then((next) => handleResult(next, nextBlockId))
      .catch((err) => handleLoadFailure(err, nextBlockId));
  };

  const entryFor = (id: number): Entry => entries[id] ?? { status: DEFAULT_STATUS, remarks: '' };
  const setEntry = (id: number, patch: Partial<Entry>) =>
    setEntries((current) => ({ ...current, [id]: { ...entryFor(id), ...patch } }));
  const setAll = (status: string) =>
    setEntries(Object.fromEntries((result?.rows ?? []).map((row) => [row.id, { ...entryFor(row.id), status }])));

  const rows = result?.rows ?? [];
  const counts = ATTENDANCE_STATUSES.map((status) => ({
    status,
    count: rows.filter((row) => entryFor(row.id).status === status).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) return;
    try {
      setSubmitting(true);
      setError(null);
      await bulkMarkAttendance({
        attendance_date: date,
        session,
        entries: rows.map((row) => ({ resident_id: row.id, ...entryFor(row.id) })),
      });
      toast.success(`Roll call saved for ${rows.length} residents`);
      navigate('/hostel/attendance');
    } catch (err) {
      // e.g. a roll call for this date and session was already taken
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to save roll call'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/attendance" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to attendance
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Roll Call</h1>
        <p className="text-slate-600 mt-1">Mark attendance for many residents at once. Everyone starts as present.</p>
      </div>

      {ready && !can('mark') ? (
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
              <select value={session} onChange={(e) => setSession(e.target.value)} className={inputClass} aria-label="Session">
                {ATTENDANCE_SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
              <BlockSelect
                id="rollcall_block"
                value={blockId}
                onChange={handleBlockChange}
                blocks={blocks}
                loaded={loaded}
                placeholder="All residents"
                className={`${inputClass} md:w-64`}
              />
            </div>

            {error && (
              <div className="m-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {loadError && (
              <div className="m-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {loadError}
              </div>
            )}

            {!result ? (
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
                    <Button type="button" variant="secondary" size="sm" onClick={() => setAll('present')}>
                      All present
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setAll('absent')}>
                      All absent
                    </Button>
                  </div>
                </div>

                {result.truncated && (
                  <p className="px-4 pt-3 text-sm text-amber-700">
                    Showing the first {PAGE_LIMIT} residents. Pick a block to take roll call for the rest.
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Resident</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const entry = entryFor(row.id);
                        return (
                          <tr key={row.id} className="border-b border-slate-100">
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900">{row.name}</p>
                              {row.admissionNo && <p className="text-xs text-slate-500">{row.admissionNo}</p>}
                            </td>
                            <td className="py-3 px-4">
                              <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
                                {ATTENDANCE_STATUSES.map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => setEntry(row.id, { status })}
                                    className={cn(
                                      'px-3 py-1.5 text-xs font-medium border-r border-slate-300 last:border-r-0 transition-colors',
                                      entry.status === status
                                        ? STATUS_STYLES[status]
                                        : 'bg-white text-slate-600 hover:bg-slate-50'
                                    )}
                                  >
                                    {statusLabel(status)}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              {entry.status !== DEFAULT_STATUS && (
                                <input
                                  type="text"
                                  value={entry.remarks}
                                  onChange={(e) => setEntry(row.id, { remarks: e.target.value })}
                                  placeholder="Remarks"
                                  className={`${inputClass} w-full`}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => navigate('/hostel/attendance')} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting || !date || !session}>
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

import { useEffect, useState } from 'react';
import Card from '../../../../components/ui/Card';
import PaginationBar from '../../components/common/PaginationBar';
import { getCommunicationLogs, updateCommunicationLog } from '../../api/communicationLogs.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { flattenRecord, formatValue, humanizeKey } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/errors';
import { recordId, recordStatus } from '../../utils/records';
import type { GenericRecord, Pagination } from '../../types/profile.types';

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ['sent', 'failed', 'pending', 'queued'];

const inputClass =
  'px-2 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

interface EditState {
  status: string;
  failure_reason: string;
}

export default function CommunicationLogsPage() {
  const { toast } = useToast();
  const { can } = useResourceAccess('communication_logs');
  const [logs, setLogs] = useState<GenericRecord[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCommunicationLogs({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setLogs(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load communication logs'));
      });
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!logs) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const flatRows = logs.map(flattenRecord);
  const columns = Object.keys(flatRows[0] ?? {})
    .filter((key) => !/(^id$|_id$|status|failure_reason)/.test(key) && typeof flatRows[0][key] !== 'object')
    .slice(0, 4);

  const editFor = (id: string, row: GenericRecord): EditState =>
    edits[id] ?? { status: recordStatus(row) ?? '', failure_reason: typeof row.failure_reason === 'string' ? row.failure_reason : '' };

  const setEdit = (id: string, patch: Partial<EditState>, row: GenericRecord) =>
    setEdits((prev) => ({ ...prev, [id]: { ...editFor(id, row), ...patch } }));

  const handleSave = async (id: string) => {
    const edit = edits[id];
    if (!edit) return;
    try {
      setSavingId(id);
      await updateCommunicationLog(id, edit);
      toast.success('Log updated');
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setReloadKey((key) => key + 1);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update log'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Communication Logs</h1>
        <p className="text-slate-600 mt-1">Messages the alumni system has sent, and whether they went through</p>
      </div>

      <Card className="border-slate-200">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No communication logs found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {columns.map((column) => (
                      <th key={column} className="text-left py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {humanizeKey(column)}
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Failure Reason</th>
                    {can('update') && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => {
                    const id = recordId(log, 'log_id', 'communication_log_id');
                    const edit = id ? editFor(id, log) : { status: recordStatus(log) ?? '', failure_reason: '' };
                    const dirty = id ? !!edits[id] : false;
                    return (
                      <tr key={id ?? index} className="border-b border-slate-100 hover:bg-slate-50">
                        {columns.map((column) => (
                          <td key={column} className="py-3 px-4 text-slate-600">
                            {formatValue(column, flatRows[index][column])}
                          </td>
                        ))}
                        <td className="py-3 px-4">
                          {id && can('update') ? (
                            <select
                              value={edit.status}
                              onChange={(e) => setEdit(id, { status: e.target.value }, log)}
                              className={inputClass}
                            >
                              <option value="">—</option>
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            edit.status || '—'
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {id && can('update') ? (
                            <input
                              type="text"
                              value={edit.failure_reason}
                              onChange={(e) => setEdit(id, { failure_reason: e.target.value }, log)}
                              placeholder="Optional"
                              className={`${inputClass} w-full`}
                            />
                          ) : (
                            edit.failure_reason || '—'
                          )}
                        </td>
                        {can('update') && (
                          <td className="py-3 px-4 text-right">
                            {id && dirty && (
                              <button
                                type="button"
                                onClick={() => handleSave(id)}
                                disabled={savingId === id}
                                className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                              >
                                {savingId === id ? 'Saving...' : 'Save'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}

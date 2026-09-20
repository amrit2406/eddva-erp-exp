import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { getFeeStructures } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { getApiErrorMessage } from '../../utils/errors';
import { FEE_STRUCTURES_RESOURCE } from '../../utils/feeStructures';
import { formatCurrency, formatDate } from '../../utils/format';
import type { FeeStructure, Pagination } from '../../types/admission.types';

const PAGE_SIZE = 10;

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function FeeStructuresPage() {
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(FEE_STRUCTURES_RESOURCE);
  const { programs, status: programsStatus, nameOf: programName } = useProgramOptions();
  const { sessions, status: sessionsStatus, nameOf: sessionName } = useSessionOptions();
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [sessionId, setSessionId] = useState<number | ''>('');
  const [programId, setProgramId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFeeStructures({ page, limit: PAGE_SIZE, session_id: sessionId, program_id: programId })
      .then((result) => {
        if (cancelled) return;
        setStructures(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load fee structures'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, sessionId, programId]);

  const toId = (value: string): number | '' => (value === '' ? '' : Number(value));
  const showFilters = sessionsStatus === 'ready' || programsStatus === 'ready';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Structures</h1>
          <p className="text-slate-600 mt-1">Admission fee and due date for each program and session</p>
        </div>
        {can('create') && (
          <Link to="/admission/fee-structures/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200">
        {showFilters && (
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
            {sessionsStatus === 'ready' && (
              <select
                value={sessionId}
                onChange={(e) => {
                  setSessionId(toId(e.target.value));
                  setPage(1);
                }}
                className={`${selectClass} w-full sm:w-56`}
              >
                <option value="">All sessions</option>
                {sessions.map((s) => (
                  <option key={s.session_id} value={s.session_id}>{s.name}</option>
                ))}
              </select>
            )}
            {programsStatus === 'ready' && (
              <select
                value={programId}
                onChange={(e) => {
                  setProgramId(toId(e.target.value));
                  setPage(1);
                }}
                className={`${selectClass} w-full sm:w-56`}
              >
                <option value="">All programs</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={p.program_id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Program</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Session</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Due Date</th>
                    {can('update') && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {structures.length === 0 ? (
                    <tr>
                      <td colSpan={can('update') ? 5 : 4} className="text-center py-8 text-slate-500">
                        No fee structures found
                      </td>
                    </tr>
                  ) : (
                    structures.map((structure) => (
                      <tr key={structure.fee_structure_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {structure.program?.name ?? programName(structure.program_id) ?? `Program #${structure.program_id}`}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {structure.session?.name ?? sessionName(structure.session_id) ?? `Session #${structure.session_id}`}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(structure.amount)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(structure.due_date)}</td>
                        {can('update') && (
                          <td className="py-3 px-4 text-right">
                            <Link to={`/admission/fee-structures/${structure.fee_structure_id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
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

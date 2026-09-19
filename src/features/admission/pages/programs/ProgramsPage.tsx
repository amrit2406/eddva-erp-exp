import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { deleteProgram, getPrograms } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { AdmissionProgram, Pagination } from '../../types/admission.types';

const PAGE_SIZE = 10;

export default function ProgramsPage() {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('programs');
  const [programs, setPrograms] = useState<AdmissionProgram[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPrograms({ page, limit: PAGE_SIZE, search: debouncedSearch })
      .then((result) => {
        if (cancelled) return;
        setPrograms(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load programs'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, reloadKey]);

  const handleDelete = useCallback(
    async (program: AdmissionProgram) => {
      if (!window.confirm(`Delete program "${program.name}"?`)) return;
      try {
        await deleteProgram(program.program_id);
        toast.success('Program deleted');
        if (programs.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err: any) {
        // e.g. programs that already have applications/enquiries can't be deleted
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete program'));
      }
    },
    [page, programs.length, toast]
  );

  const showActions = can('update') || can('delete');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programs</h1>
          <p className="text-slate-600 mt-1">Classes and courses applicants can be admitted into</p>
        </div>
        {can('create') && (
          <Link to="/admission/programs/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
        </div>

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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Seats</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Eligibility</th>
                    {showActions && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan={showActions ? 5 : 4} className="text-center py-8 text-slate-500">
                        No programs found
                      </td>
                    </tr>
                  ) : (
                    programs.map((program) => (
                      <tr key={program.program_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{program.name}</td>
                        <td className="py-3 px-4 text-slate-600">{program.level}</td>
                        <td className="py-3 px-4 text-slate-600">{program.total_seats}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell max-w-xs truncate" title={program.eligibility_criteria ?? undefined}>
                          {program.eligibility_criteria || '—'}
                        </td>
                        {showActions && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {can('update') && (
                                <Link to={`/admission/programs/${program.program_id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {can('delete') && (
                                <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(program)}>
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
            {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}

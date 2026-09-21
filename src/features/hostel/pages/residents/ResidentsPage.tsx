import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import ResidentStatusBadge from '../../components/residents/ResidentStatusBadge';
import { getResidents } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelResident, Pagination } from '../../types/hostel.types';

const PAGE_SIZE = 20;

export default function ResidentsPage() {
  const { can, ready } = useResourceAccess('residents');
  const [residents, setResidents] = useState<HostelResident[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    getResidents({ page, limit: PAGE_SIZE, search: debouncedSearch })
      .then((result) => {
        if (cancelled) return;
        setResidents(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to load residents'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Residents</h1>
          <p className="text-slate-600 mt-1">Students staying in the hostel</p>
        </div>
        {can('create') && (
          <Link to="/hostel/residents/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Resident
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or admission no..."
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Resident</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Admission No</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Grade</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Guardian</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No residents found
                      </td>
                    </tr>
                  ) : (
                    residents.map((resident) => (
                      <tr key={resident.resident_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/hostel/residents/${resident.resident_id}`}
                            className="font-medium text-slate-900 hover:text-[#008BE9]"
                          >
                            {resident.student_name}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">{resident.gender}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{resident.admission_no}</td>
                        <td className="py-3 px-4 text-slate-600">{resident.grade || '—'}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                          {resident.guardian_name || '—'}
                          {resident.guardian_phone && (
                            <p className="text-xs text-slate-500 mt-0.5">{resident.guardian_phone}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <ResidentStatusBadge resident={resident} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/hostel/residents/${resident.resident_id}`}>
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {can('update') && (
                              <Link to={`/hostel/residents/${resident.resident_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
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

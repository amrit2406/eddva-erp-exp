import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { getMentorshipPrograms } from '../../api/mentorshipPrograms.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import type { Pagination } from '../../types/profile.types';
import type { MentorshipProgram } from '../../types/mentorship.types';

const PAGE_SIZE = 20;

export default function MentorshipProgramsPage() {
  const { can, ready } = useResourceAccess('mentorship_programs');
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMentorshipPrograms({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setPrograms(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load programs'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentorship Programs</h1>
          <p className="text-slate-600 mt-1">Structured mentor-mentee programs</p>
        </div>
        {can('create') && (
          <Link to="/alumni/mentorship-programs/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Start</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">End</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">
                        No programs found
                      </td>
                    </tr>
                  ) : (
                    programs.map((program) => (
                      <tr key={program.program_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/alumni/mentorship-programs/${program.program_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {program.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatValue('start_date', program.start_date)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatValue('end_date', program.end_date)}</td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{program.status || '—'}</td>
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

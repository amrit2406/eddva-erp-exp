import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { getJobs } from '../../api/jobs.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import type { Pagination } from '../../types/profile.types';
import type { JobPosting } from '../../types/jobs.types';

const PAGE_SIZE = 20;

export default function JobsPage() {
  const { can, ready } = useResourceAccess('jobs');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getJobs({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setJobs(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load jobs'));
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
          <h1 className="text-2xl font-bold text-slate-900">Job Board</h1>
          <p className="text-slate-600 mt-1">Job postings shared with alumni</p>
        </div>
        {can('create') && (
          <Link to="/alumni/jobs/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Expires</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.job_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link to={`/alumni/jobs/${job.job_id}`} className="font-medium text-slate-900 hover:text-blue-600">
                            {job.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{job.company}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">{job.location || '—'}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                          {formatValue('expiry_date', job.expiry_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{job.status || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {can('update') && (
                              <Link to={`/alumni/jobs/${job.job_id}/edit`}>
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

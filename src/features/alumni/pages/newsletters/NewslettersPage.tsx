import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { getNewsletters } from '../../api/newsletters.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import type { Pagination } from '../../types/profile.types';
import type { Newsletter } from '../../types/newsletters.types';

const PAGE_SIZE = 20;

export default function NewslettersPage() {
  const { can, ready } = useResourceAccess('newsletters');
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNewsletters({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setNewsletters(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load newsletters'));
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
          <h1 className="text-2xl font-bold text-slate-900">Newsletters</h1>
          <p className="text-slate-600 mt-1">Segmented email and SMS updates for alumni</p>
        </div>
        {can('create') && (
          <Link to="/alumni/newsletters/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Newsletter
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-slate-500">
                        No newsletters found
                      </td>
                    </tr>
                  ) : (
                    newsletters.map((newsletter) => (
                      <tr key={newsletter.newsletter_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/alumni/newsletters/${newsletter.newsletter_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {newsletter.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{newsletter.status || '—'}</td>
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

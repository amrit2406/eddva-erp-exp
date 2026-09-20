import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { InterviewStatusBadge, RecommendationBadge } from '../../components/interviews/InterviewBadges';
import { getInterviews } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDateTime, formatLabel } from '../../utils/format';
import { INTERVIEWS_RESOURCE, getEvaluation, interviewApplicantName } from '../../utils/interviews';
import {
  INTERVIEW_MODES,
  INTERVIEW_STATUSES,
  type Interview,
  type InterviewMode,
  type InterviewStatus,
  type Pagination,
} from '../../types/admission.types';

const PAGE_SIZE = 10;

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function InterviewsPage() {
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(INTERVIEWS_RESOURCE);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<InterviewStatus | ''>('');
  const [mode, setMode] = useState<InterviewMode | ''>('');
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
    getInterviews({ page, limit: PAGE_SIZE, search: debouncedSearch, status, mode })
      .then((result) => {
        if (cancelled) return;
        setInterviews(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load interviews'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>
          <p className="text-slate-600 mt-1">Schedule interviews, track their status and record evaluations</p>
        </div>
        {can('create') && (
          <Link to="/admission/interviews/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as InterviewStatus | '');
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {INTERVIEW_STATUSES.map((s) => (
              <option key={s} value={s}>{formatLabel(s)}</option>
            ))}
          </select>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as InterviewMode | '');
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All modes</option>
            {INTERVIEW_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Applicant</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Mode</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Evaluation</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No interviews found
                      </td>
                    </tr>
                  ) : (
                    interviews.map((interview) => {
                      const evaluation = getEvaluation(interview);
                      return (
                        <tr key={interview.interview_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Link
                              to={`/admission/interviews/${interview.interview_id}`}
                              className="font-medium text-slate-900 hover:text-[#008BE9]"
                            >
                              {interviewApplicantName(interview)}
                            </Link>
                            <div className="text-xs text-slate-500">Application #{interview.application_id}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{formatDateTime(interview.scheduled_datetime)}</td>
                          <td className="py-3 px-4 text-slate-600 capitalize">
                            {interview.mode}
                            {interview.venue_or_link && (
                              <div className="text-xs text-slate-500 normal-case truncate max-w-[14rem]">{interview.venue_or_link}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <InterviewStatusBadge status={interview.status} />
                          </td>
                          <td className="py-3 px-4">
                            {evaluation ? (
                              <div className="flex items-center gap-2">
                                {evaluation.score !== null && evaluation.score !== '' && evaluation.score !== undefined && (
                                  <span className="font-medium text-slate-900">{Number(evaluation.score)}</span>
                                )}
                                {evaluation.recommendation && <RecommendationBadge recommendation={evaluation.recommendation} />}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/admission/interviews/${interview.interview_id}`}>
                                <Button variant="ghost" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {can('update') && (
                                <Link to={`/admission/interviews/${interview.interview_id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Reschedule / edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

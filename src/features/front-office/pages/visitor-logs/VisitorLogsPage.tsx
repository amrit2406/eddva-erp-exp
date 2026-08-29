import { useEffect, useState } from 'react';
import { LogIn, Users } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { useToast } from '../../../../hooks/useToast';
import { getActiveVisitorLogs, getVisitorLogs, checkInVisitor, checkOutVisitor } from '../../api/visitorLogs.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import VisitorLogTable from '../../components/visitor-logs/VisitorLogTable';
import CheckInModal from '../../components/visitor-logs/CheckInModal';
import CheckOutModal from '../../components/visitor-logs/CheckOutModal';
import type { VisitorLogSummary, VisitorLogPagination, CheckInFormData, CheckOutFormData } from '../../types/visitorLog.types';

type Tab = 'active' | 'all';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
];

export default function VisitorLogsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('active');
  const [logs, setLogs] = useState<VisitorLogSummary[]>([]);
  const [pagination, setPagination] = useState<VisitorLogPagination | null>(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkOutTarget, setCheckOutTarget] = useState<VisitorLogSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [tab, date, status]);

  useEffect(() => {
    load();
  }, [tab, date, status, page]);

  async function load() {
    try {
      setLoading(true);
      if (tab === 'active') {
        const data = await getActiveVisitorLogs();
        setLogs(data);
        setPagination(null);
      } else {
        const result = await getVisitorLogs({
          date: date || undefined,
          status: (status || undefined) as any,
          page,
          limit: 25,
        });
        setLogs(result.data);
        setPagination(result.pagination);
      }
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load visitor logs'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(data: CheckInFormData) {
    setIsSubmitting(true);
    try {
      const log = await checkInVisitor(data);
      toast.success(`Checked in. Badge ${log.badge_number}.`);
      setIsCheckInOpen(false);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCheckOut(data: CheckOutFormData) {
    if (!checkOutTarget) return;
    setIsSubmitting(true);
    try {
      await checkOutVisitor(checkOutTarget.log_id, data);
      toast.success('Visitor checked out.');
      setCheckOutTarget(null);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitor Logs</h1>
          <p className="text-slate-600 mt-1">Check visitors in and out, and review visit history</p>
        </div>
        <Button variant="primary" onClick={() => setIsCheckInOpen(true)}>
          <LogIn className="h-4 w-4 mr-2" />
          Check In Visitor
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex gap-1 text-sm bg-slate-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setTab('active')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${tab === 'active' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                <Users className="h-3.5 w-3.5" />
                Currently In
              </button>
              <button
                onClick={() => setTab('all')}
                className={`px-3 py-1.5 rounded-md ${tab === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                All Logs
              </button>
            </div>

            {tab === 'all' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={STATUS_OPTIONS}
                  className="w-44"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <>
              <VisitorLogTable logs={logs} onCheckOut={setCheckOutTarget} />
              {tab === 'all' && pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm text-slate-600">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} logs)
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={handleCheckIn}
        isLoading={isSubmitting}
      />
      <CheckOutModal
        isOpen={!!checkOutTarget}
        onClose={() => setCheckOutTarget(null)}
        log={checkOutTarget}
        onSubmit={handleCheckOut}
        isLoading={isSubmitting}
      />
    </div>
  );
}

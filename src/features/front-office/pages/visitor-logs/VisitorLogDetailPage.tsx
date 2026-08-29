import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Building2, Calendar, Clock } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import { getVisitorLog, checkOutVisitor } from '../../api/visitorLogs.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import CheckOutModal from '../../components/visitor-logs/CheckOutModal';
import type { VisitorLogDetail, CheckOutFormData } from '../../types/visitorLog.types';
import { cn } from '../../../../utils/cn';

export default function VisitorLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [log, setLog] = useState<VisitorLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getVisitorLog(id);
      setLog(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load visitor log'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut(data: CheckOutFormData) {
    if (!log) return;
    setIsSubmitting(true);
    try {
      await checkOutVisitor(log.log_id, data);
      toast.success('Visitor checked out.');
      setIsCheckOutOpen(false);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!log) {
    return <div className="text-center py-8 text-slate-500">Visitor log not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/visitor-logs" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Visitor Logs
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {log.visitor?.full_name ?? `Visitor #${log.visitor_id}`}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                log.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              )}
            >
              {log.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
            </span>
          </h1>
          <p className="text-slate-600 mt-1">Badge {log.badge_number}</p>
        </div>
        {log.status === 'checked_in' && (
          <Button onClick={() => setIsCheckOutOpen(true)}>
            <LogOut className="h-4 w-4 mr-2" />
            Check Out
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> Host
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{log.host_employee?.name ?? `#${log.host_employee_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Check In
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{new Date(log.check_in_time).toLocaleString()}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Check Out
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {log.check_out_time ? new Date(log.check_out_time).toLocaleString() : '—'}
          </p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Visitor
          </h3>
          <div className="text-sm text-slate-600 space-y-1">
            <p><span className="font-medium text-slate-900">Name:</span> {log.visitor?.full_name ?? '—'}</p>
            <p><span className="font-medium text-slate-900">Phone:</span> {log.visitor?.phone ?? '—'}</p>
            <p><span className="font-medium text-slate-900">Email:</span> {log.visitor?.email ?? '—'}</p>
            <p><span className="font-medium text-slate-900">Organization:</span> {log.visitor?.organization ?? '—'}</p>
            <p><span className="font-medium text-slate-900">Purpose:</span> {log.purpose ?? '—'}</p>
            {log.visitor && (
              <Link to={`/front-office/visitors/${log.visitor.visitor_id}`} className="text-blue-600 hover:underline text-sm inline-block mt-1">
                View visitor profile →
              </Link>
            )}
          </div>
        </div>
      </Card>

      {log.appointment && (
        <Card className="border-slate-200">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Linked Appointment
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium text-slate-900">Purpose:</span> {log.appointment.purpose ?? '—'}</p>
              <p>
                <span className="font-medium text-slate-900">Scheduled:</span>{' '}
                {new Date(log.appointment.appointment_date).toLocaleDateString()} ·{' '}
                {new Date(log.appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p><span className="font-medium text-slate-900">Status:</span> {log.appointment.status}</p>
            </div>
          </div>
        </Card>
      )}

      <CheckOutModal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        log={log}
        onSubmit={handleCheckOut}
        isLoading={isSubmitting}
      />
    </div>
  );
}

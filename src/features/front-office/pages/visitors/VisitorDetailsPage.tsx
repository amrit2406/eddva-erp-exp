import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, Phone, Building2, Calendar, History, ShieldCheck } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import { getVisitor, getVisitorVisits, getVisitorAppointments, getVisitorAudit } from '../../api/visitors.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type {
  FrontOfficeVisitor,
  VisitorVisit,
  VisitorAppointment,
  VisitorAuditLog,
} from '../../types/visitorRecord.types';
import { cn } from '../../../../utils/cn';

const APPOINTMENT_STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-amber-100 text-amber-700',
};

export default function VisitorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [visitor, setVisitor] = useState<FrontOfficeVisitor | null>(null);
  const [visits, setVisits] = useState<VisitorVisit[]>([]);
  const [appointments, setAppointments] = useState<VisitorAppointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<VisitorAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [visitorData, visitsData, appointmentsData, auditData] = await Promise.all([
        getVisitor(id),
        getVisitorVisits(id),
        getVisitorAppointments(id),
        getVisitorAudit(id),
      ]);
      setVisitor(visitorData);
      setVisits(visitsData);
      setAppointments(appointmentsData);
      setAuditLogs(auditData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load visitor'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!visitor) {
    return <div className="text-center py-8 text-slate-500">Visitor not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/visitors" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Visitors
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {visitor.photo_url ? (
              <img src={visitor.photo_url} alt={visitor.full_name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-slate-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{visitor.full_name}</h1>
            <p className="text-slate-600 mt-1">{visitor.organization || 'No organization'}</p>
          </div>
        </div>
        <Link to={`/front-office/visitors/${visitor.visitor_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Visitor
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Phone
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{visitor.phone || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{visitor.email || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> ID Proof
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {visitor.id_proof_type ? `${visitor.id_proof_type} · ${visitor.id_proof_number ?? '—'}` : '—'}
          </p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-blue-600" />
            Visit History
          </h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Host</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Purpose</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Badge</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Check In</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Check Out</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No visits recorded.
                    </td>
                  </tr>
                ) : (
                  visits.map((visit) => (
                    <tr key={visit.log_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{visit.host_employee?.name ?? `#${visit.host_employee_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{visit.purpose || '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{visit.badge_number}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(visit.check_in_time).toLocaleString()}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {visit.check_out_time ? new Date(visit.check_out_time).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            visit.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {visit.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointment History
          </h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Host</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Department</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Purpose</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date & Time</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.appointment_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{appt.host_employee?.name ?? `#${appt.host_employee_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{appt.department?.name ?? `#${appt.department_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{appt.purpose || '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(appt.appointment_date).toLocaleDateString()} · {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-4">
                        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', APPOINTMENT_STATUS_STYLE[appt.status] ?? 'bg-slate-100 text-slate-600')}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Audit Trail
          </h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Action</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">By</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">When</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No audit history.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900 capitalize">{log.action.replace(/_/g, ' ')}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{log.user?.name ?? 'System'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Building2 className="h-3 w-3" />
        Registered {new Date(visitor.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, UserCog, RefreshCw, Clock, History, Mail, Phone, Tag } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import {
  getEnquiry,
  assignEnquiry,
  changeEnquiryStatus,
  createEnquiryFollowup,
  getEnquiryFollowups,
  getEnquiryHistory,
} from '../../api/enquiries.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import AssignEnquiryModal from '../../components/enquiries/AssignEnquiryModal';
import ChangeStatusModal from '../../components/enquiries/ChangeStatusModal';
import EnquiryFollowupForm from '../../components/enquiries/EnquiryFollowupForm';
import EnquiryFollowupTimeline from '../../components/enquiries/EnquiryFollowupTimeline';
import EntityAttachments from '../../components/attachments/EntityAttachments';
import type {
  FrontOfficeEnquiry,
  FrontOfficeEnquiryFollowup,
  AssignEnquiryFormData,
  ChangeEnquiryStatusFormData,
  CreateFollowupFormData,
  FrontOfficeEnquiryStatus,
} from '../../types/enquiryRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import type { VisitorAuditLog } from '../../types/visitorRecord.types';
import { cn } from '../../../../utils/cn';

const STATUS_STYLE: Record<FrontOfficeEnquiryStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-600',
};

export default function EnquiryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [enquiry, setEnquiry] = useState<FrontOfficeEnquiry | null>(null);
  const [followups, setFollowups] = useState<FrontOfficeEnquiryFollowup[]>([]);
  const [history, setHistory] = useState<VisitorAuditLog[]>([]);
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
    getEmployees({ limit: 100 }).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [enquiryData, followupData, historyData] = await Promise.all([
        getEnquiry(id),
        getEnquiryFollowups(id),
        getEnquiryHistory(id),
      ]);
      setEnquiry(enquiryData);
      setFollowups(followupData);
      setHistory(historyData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load enquiry'));
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(data: AssignEnquiryFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await assignEnquiry(id, data);
      toast.success('Enquiry assigned.');
      setIsAssignOpen(false);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(data: ChangeEnquiryStatusFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await changeEnquiryStatus(id, data);
      toast.success('Status updated.');
      setIsStatusOpen(false);
      load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddFollowup(data: CreateFollowupFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await createEnquiryFollowup(id, data);
      toast.success('Follow-up added.');
      setShowFollowupForm(false);
      const [followupData, enquiryData] = await Promise.all([getEnquiryFollowups(id), getEnquiry(id)]);
      setFollowups(followupData);
      setEnquiry(enquiryData);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!enquiry) {
    return <div className="text-center py-8 text-slate-500">Enquiry not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/enquiries" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Enquiries
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {enquiry.enquirer_name}
            <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_STYLE[enquiry.status])}>
              {enquiry.status.replace('_', ' ')}
            </span>
          </h1>
          <p className="text-slate-600 mt-1 capitalize">{enquiry.category} · {enquiry.source.replace('_', ' ')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/front-office/enquiries/${enquiry.enquiry_id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => setIsAssignOpen(true)}>
            <UserCog className="h-4 w-4 mr-2" />
            {enquiry.assignee ? 'Reassign' : 'Assign'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsStatusOpen(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Change Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Phone
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{enquiry.phone || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{enquiry.email || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Assigned To
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{enquiry.assignee?.name ?? 'Unassigned'}</p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <p className="text-sm text-slate-600">{enquiry.description}</p>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Follow-ups
            </h3>
            {enquiry.status !== 'closed' && (
              <Button variant="secondary" size="sm" onClick={() => setShowFollowupForm(!showFollowupForm)}>
                {showFollowupForm ? 'Cancel' : 'Add Follow-up'}
              </Button>
            )}
          </div>

          {showFollowupForm && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <EnquiryFollowupForm
                onSubmit={handleAddFollowup}
                onCancel={() => setShowFollowupForm(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          <EnquiryFollowupTimeline followups={followups} />
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-blue-600" />
            Audit History
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
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No audit history.
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
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

      <Card className="border-slate-200">
        <div className="p-6">
          <EntityAttachments entityType="enquiry" entityId={enquiry.enquiry_id} />
        </div>
      </Card>

      <AssignEnquiryModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        employees={employees}
        currentAssigneeId={enquiry.assigned_to}
        onSubmit={handleAssign}
        isLoading={isSubmitting}
      />
      <ChangeStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        currentStatus={enquiry.status}
        onSubmit={handleStatusChange}
        isLoading={isSubmitting}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, History, Mail, Phone, Tag, ListChecks } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintStatusActions from '../../components/complaints/ComplaintStatusActions';
import ComplaintUpdateForm from '../../components/complaints/ComplaintUpdateForm';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import AssignComplaintModal from '../../components/complaints/AssignComplaintModal';
import ChangePriorityModal from '../../components/complaints/ChangePriorityModal';
import ChangeComplaintStatusModal from '../../components/complaints/ChangeComplaintStatusModal';
import EscalateComplaintModal from '../../components/complaints/EscalateComplaintModal';
import EntityAttachments from '../../components/attachments/EntityAttachments';
import { useToast } from '../../../../hooks/useToast';
import {
  getComplaint,
  assignComplaint,
  changeComplaintPriority,
  changeComplaintStatus,
  resolveComplaint,
  closeComplaint,
  escalateComplaint,
  createComplaintUpdate,
  getComplaintUpdates,
  getComplaintAudit,
} from '../../api/complaints.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type {
  FrontOfficeComplaint,
  FrontOfficeComplaintUpdate,
  AssignComplaintFormData,
  ChangeComplaintPriorityFormData,
  ChangeComplaintStatusFormData,
  EscalateComplaintFormData,
  CreateComplaintUpdateFormData,
} from '../../types/complaintRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import type { VisitorAuditLog } from '../../types/visitorRecord.types';

export default function ComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<FrontOfficeComplaint | null>(null);
  const [updates, setUpdates] = useState<FrontOfficeComplaintUpdate[]>([]);
  const [audit, setAudit] = useState<VisitorAuditLog[]>([]);
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
    getEmployees({ limit: 100 }).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [complaintData, updatesData, auditData] = await Promise.all([
        getComplaint(id),
        getComplaintUpdates(id),
        getComplaintAudit(id),
      ]);
      setComplaint(complaintData);
      setUpdates(updatesData);
      setAudit(auditData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load complaint'));
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(data: AssignComplaintFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await assignComplaint(id, data);
      toast.success('Complaint assigned.');
      setIsAssignOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePriority(data: ChangeComplaintPriorityFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await changeComplaintPriority(id, data);
      toast.success('Priority updated.');
      setIsPriorityOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangeStatus(data: ChangeComplaintStatusFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await changeComplaintStatus(id, data);
      toast.success('Status updated.');
      setIsStatusOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEscalate(data: EscalateComplaintFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await escalateComplaint(id, data);
      toast.success('Complaint escalated.');
      setIsEscalateOpen(false);
      await load();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResolve() {
    if (!id) return;
    if (!window.confirm('Mark this complaint as resolved?')) return;
    setIsSubmitting(true);
    try {
      await resolveComplaint(id);
      toast.success('Complaint resolved.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to resolve complaint'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCloseComplaint() {
    if (!id) return;
    if (!window.confirm('Close this complaint?')) return;
    setIsSubmitting(true);
    try {
      await closeComplaint(id);
      toast.success('Complaint closed.');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to close complaint'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddUpdate(data: CreateComplaintUpdateFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await createComplaintUpdate(id, data);
      toast.success('Update added.');
      setShowUpdateForm(false);
      const updatesData = await getComplaintUpdates(id);
      setUpdates(updatesData);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!complaint) {
    return <div className="text-center py-8 text-slate-500">Complaint not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/complaints" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Complaints
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 flex-wrap">
            {complaint.complainant_name}
            <StatusBadge status={complaint.status} variant="complaint" />
            <PriorityBadge priority={complaint.priority} />
          </h1>
          <p className="text-slate-600 mt-1 capitalize">{complaint.category}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/front-office/complaints/${complaint.complaint_id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <ComplaintStatusActions
            status={complaint.status}
            onAssign={() => setIsAssignOpen(true)}
            onChangePriority={() => setIsPriorityOpen(true)}
            onChangeStatus={() => setIsStatusOpen(true)}
            onEscalate={() => setIsEscalateOpen(true)}
            onResolve={handleResolve}
            onCloseComplaint={handleCloseComplaint}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Phone
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{complaint.phone || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{complaint.email || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Assigned To
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{complaint.assignee?.name ?? 'Unassigned'}</p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <p className="text-sm text-slate-600">{complaint.description}</p>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              Updates
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setShowUpdateForm(!showUpdateForm)}>
              {showUpdateForm ? 'Cancel' : 'Add Update'}
            </Button>
          </div>

          {showUpdateForm && (
            <div className="mb-6 pb-6 border-b border-slate-200">
              <ComplaintUpdateForm
                onSubmit={handleAddUpdate}
                onCancel={() => setShowUpdateForm(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          <ComplaintTimeline updates={updates} />
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
                {audit.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No audit history.
                    </td>
                  </tr>
                ) : (
                  audit.map((log) => (
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
          <EntityAttachments entityType="complaint" entityId={complaint.complaint_id} />
        </div>
      </Card>

      <AssignComplaintModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        employees={employees}
        currentAssigneeId={complaint.assigned_to}
        onSubmit={handleAssign}
        isLoading={isSubmitting}
      />
      <ChangePriorityModal
        isOpen={isPriorityOpen}
        onClose={() => setIsPriorityOpen(false)}
        currentPriority={complaint.priority}
        onSubmit={handleChangePriority}
        isLoading={isSubmitting}
      />
      <ChangeComplaintStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        currentStatus={complaint.status}
        onSubmit={handleChangeStatus}
        isLoading={isSubmitting}
      />
      <EscalateComplaintModal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        employees={employees}
        onSubmit={handleEscalate}
        isLoading={isSubmitting}
      />
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, MessageSquarePlus, Pencil, RefreshCw, UserPlus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordPanel from '../../components/common/RecordPanel';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import AssignComplaintModal from '../../components/complaints/AssignComplaintModal';
import PriorityBadge from '../../components/complaints/PriorityBadge';
import ActionModal, { type ActionField, type ActionValues } from '../../components/residents/ActionModal';
import {
  addComplaintUpdate,
  assignComplaint,
  changeComplaintStatus,
  closeComplaint,
  getComplaint,
  getComplaintHistory,
  getComplaintUpdates,
  resolveComplaint,
  updateComplaint,
} from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import {
  COMPLAINTS_RESOURCE,
  MANUAL_STATUSES,
  PRIORITIES,
  complaintActions,
} from '../../utils/complaints';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/hostel.types';

type ModalKind = 'assign' | 'status' | 'resolve' | 'close' | 'update' | 'edit';
type Tab = 'updates' | 'history';

const SUCCESS: Record<ModalKind, string> = {
  assign: 'Complaint assigned',
  status: 'Status updated',
  resolve: 'Complaint resolved',
  close: 'Complaint closed',
  update: 'Update added',
  edit: 'Complaint updated',
};

const text = (value: unknown) => (typeof value === 'string' ? value : '');

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(COMPLAINTS_RESOURCE);
  const [complaint, setComplaint] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [tab, setTab] = useState<Tab>('updates');
  // Bumped after any change so the updates and history lists refetch.
  const [panelKey, setPanelKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getComplaint(id)
      .then((data) => {
        if (!cancelled) setComplaint(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load complaint'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadUpdates = useCallback((params: ListParams) => getComplaintUpdates(id!, params), [id]);
  const loadHistory = useCallback((params: ListParams) => getComplaintHistory(id!, params), [id]);

  const finish = async (kind: ModalKind) => {
    if (!id) return;
    toast.success(SUCCESS[kind]);
    setModal(null);
    setComplaint(await getComplaint(id));
    setPanelKey((key) => key + 1);
  };

  const submit = async (values: ActionValues) => {
    if (!id || !modal) return;
    switch (modal) {
      case 'status':
        await changeComplaintStatus(id, values.status, values.notes);
        break;
      case 'resolve':
        await resolveComplaint(id, values.resolution_notes);
        break;
      case 'close':
        await closeComplaint(id, values.notes);
        break;
      case 'update':
        await addComplaintUpdate(id, values.notes);
        break;
      case 'edit':
        await updateComplaint(id, {
          category: values.category,
          description: values.description,
          priority: values.priority,
        });
        break;
    }
    await finish(modal);
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!complaint || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = recordStatus(complaint);
  const priority = text(complaint.priority) || null;
  const category = text(complaint.category);
  const residentId = relatedId(complaint, 'resident', 'resident_id');
  const roomId = relatedId(complaint, 'room', 'room_id');
  const allowed = complaintActions(status);
  // A role that can update may do the smaller steps even without the specific action.
  const may = (action: string) => can(action) || can('update');

  const modalConfig: Record<Exclude<ModalKind, 'assign'>, { title: string; submitLabel: string; description?: string; fields: ActionField[] }> = {
    status: {
      title: 'Change Status',
      submitLabel: 'Update Status',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: MANUAL_STATUSES,
          required: true,
          defaultValue: status && MANUAL_STATUSES.includes(status) ? status : '',
        },
        { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional note' },
      ],
    },
    resolve: {
      title: 'Resolve Complaint',
      submitLabel: 'Mark Resolved',
      description: 'Record what was done to fix the problem.',
      fields: [
        {
          name: 'resolution_notes',
          label: 'Resolution Notes',
          type: 'textarea',
          required: true,
          placeholder: 'e.g. Replaced the fan capacitor',
        },
      ],
    },
    close: {
      title: 'Close Complaint',
      submitLabel: 'Close Complaint',
      description: 'Closing marks the complaint as finished.',
      fields: [{ name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional note' }],
    },
    update: {
      title: 'Add Update',
      submitLabel: 'Add Update',
      fields: [
        {
          name: 'notes',
          label: 'Update',
          type: 'textarea',
          required: true,
          placeholder: 'e.g. Technician visited; part ordered',
        },
      ],
    },
    edit: {
      title: 'Edit Complaint',
      submitLabel: 'Save',
      fields: [
        { name: 'category', label: 'Category', type: 'text', required: true, defaultValue: category },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          options: PRIORITIES,
          required: true,
          defaultValue: priority ?? '',
        },
        { name: 'description', label: 'Description', type: 'textarea', required: true, defaultValue: text(complaint.description) },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/complaints" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to complaints
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {category ? `${category} complaint` : `Complaint #${id}`}
              </h1>
              <RecordStatusBadge status={status} />
              <PriorityBadge priority={priority} />
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {residentId && (
                <Link to={`/hostel/residents/${residentId}`} className="text-[#008BE9] hover:underline">
                  View resident
                </Link>
              )}
              {roomId && (
                <Link to={`/hostel/rooms/${roomId}`} className="text-[#008BE9] hover:underline">
                  View room
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {allowed.assign && may('assign') && (
              <Button variant="secondary" onClick={() => setModal('assign')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </Button>
            )}
            {allowed.changeStatus && may('status') && (
              <Button variant="secondary" onClick={() => setModal('status')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Change Status
              </Button>
            )}
            {allowed.resolve && may('resolve') && (
              <Button variant="primary" onClick={() => setModal('resolve')}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Resolve
              </Button>
            )}
            {allowed.close && may('close') && (
              <Button variant="secondary" onClick={() => setModal('close')}>
                <Lock className="h-4 w-4 mr-2" />
                Close
              </Button>
            )}
            {allowed.edit && can('update') && (
              <Button variant="ghost" onClick={() => setModal('edit')}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={complaint} emptyMessage="No details available" />
      </Card>

      <Card className="border-slate-200">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4">
          <div className="flex gap-1 overflow-x-auto">
            {(['updates', 'history'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap capitalize transition-colors',
                  tab === t
                    ? 'border-[#008BE9] text-[#008BE9]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === 'updates' && allowed.update && may('update') && (
            <Button variant="secondary" size="sm" onClick={() => setModal('update')}>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          )}
        </div>

        {tab === 'updates' ? (
          <RecordPanel key={`updates-${panelKey}`} load={loadUpdates} emptyMessage="No updates yet" />
        ) : (
          <RecordPanel key={`history-${panelKey}`} load={loadHistory} emptyMessage="No history yet" />
        )}
      </Card>

      {modal === 'assign' && (
        <AssignComplaintModal
          currentAssignee={text(complaint.assigned_to)}
          onClose={() => setModal(null)}
          onSubmit={async (assignedTo, notes) => {
            await assignComplaint(id!, assignedTo, notes);
            await finish('assign');
          }}
        />
      )}
      {modal && modal !== 'assign' && (
        <ActionModal isOpen onClose={() => setModal(null)} onSubmit={submit} {...modalConfig[modal]} />
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, BedDouble, LogOut, Pencil, Plus, RotateCcw, ShieldOff, UserPlus, Send } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordPanel from '../../components/common/RecordPanel';
import ActionModal, { type ActionField, type ActionValues } from '../../components/residents/ActionModal';
import ResidentStatusBadge from '../../components/residents/ResidentStatusBadge';
import {
  allotResident,
  getResident,
  getResidentAllotment,
  getResidentAllotmentHistory,
  getResidentAttendance,
  getResidentDisciplineRecords,
  getResidentGatePasses,
  getResidentInvoices,
  getResidentMessAttendance,
  getResidentPayments,
  getResidentTransferHistory,
  getResidentVisitors,
  readmitResident,
  reinstateResident,
  requestResidentTransfer,
  suspendResident,
  transferResident,
  vacateResident,
} from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import { currentAcademicYear, hasRecordData, statusActions, todayISO } from '../../utils/residents';
import { recordId } from '../../utils/records';
import type { GenericRecord, HostelResident, ListParams, RecordResult } from '../../types/hostel.types';

type Tab =
  | 'allotment'
  | 'allotment-history'
  | 'transfer-history'
  | 'gate-passes'
  | 'attendance'
  | 'meals'
  | 'visitors'
  | 'invoices'
  | 'payments'
  | 'discipline';
type ModalKind = 'suspend' | 'reinstate' | 'readmit' | 'allot' | 'transfer' | 'transferRequest' | 'vacate';

const TABS: { key: Tab; label: string }[] = [
  { key: 'allotment', label: 'Current Allotment' },
  { key: 'allotment-history', label: 'Allotment History' },
  { key: 'transfer-history', label: 'Transfer History' },
  { key: 'gate-passes', label: 'Gate Passes' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'meals', label: 'Meals' },
  { key: 'visitors', label: 'Visitors' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
  { key: 'discipline', label: 'Discipline' },
];

const paymentHref = (row: GenericRecord) => {
  const id = recordId(row, 'payment_id');
  return id ? `/hostel/payments/${id}` : undefined;
};

const disciplineHref = (row: GenericRecord) => {
  const id = recordId(row, 'discipline_record_id', 'record_id');
  return id ? `/hostel/discipline/${id}` : undefined;
};

const invoiceHref = (row: GenericRecord) => {
  const id = recordId(row, 'invoice_id');
  return id ? `/hostel/invoices/${id}` : undefined;
};

const visitorHref = (row: GenericRecord) => {
  const id = recordId(row, 'visitor_id');
  return id ? `/hostel/visitors/${id}` : undefined;
};

const attendanceHref = (row: GenericRecord) => {
  const id = recordId(row, 'attendance_id');
  return id ? `/hostel/attendance/${id}` : undefined;
};

const gatePassHref = (row: GenericRecord) => {
  const id = recordId(row, 'gate_pass_id', 'pass_id');
  return id ? `/hostel/gate-passes/${id}` : undefined;
};

interface ModalConfig {
  title: string;
  submitLabel: string;
  description?: string;
  fields: ActionField[];
  withRoomBed?: boolean;
}

function modalConfig(kind: ModalKind): ModalConfig {
  const today = todayISO();
  const year = currentAcademicYear();
  switch (kind) {
    case 'suspend':
      return {
        title: 'Suspend Resident',
        submitLabel: 'Suspend',
        fields: [
          { name: 'reason', label: 'Reason', type: 'textarea', required: true, placeholder: 'e.g. Repeated curfew violations' },
        ],
      };
    case 'reinstate':
      return {
        title: 'Reinstate Resident',
        submitLabel: 'Reinstate',
        fields: [
          { name: 'remarks', label: 'Remarks', type: 'textarea', required: true, placeholder: 'e.g. Suspension period served' },
        ],
      };
    case 'readmit':
      return {
        title: 'Readmit Resident',
        submitLabel: 'Readmit',
        fields: [{ name: 'admitted_on', label: 'Admitted On', type: 'date', required: true, defaultValue: today }],
      };
    case 'allot':
      return {
        title: 'Allot Room',
        submitLabel: 'Allot',
        withRoomBed: true,
        fields: [
          { name: 'academic_year', label: 'Academic Year', type: 'text', required: true, defaultValue: year, placeholder: 'e.g. 2026-27' },
          { name: 'allotment_date', label: 'Allotment Date', type: 'date', required: true, defaultValue: today },
        ],
      };
    case 'transfer':
      return {
        title: 'Transfer Resident',
        submitLabel: 'Transfer',
        description: 'Move the resident to a different room and bed.',
        withRoomBed: true,
        fields: [
          { name: 'academic_year', label: 'Academic Year', type: 'text', required: true, defaultValue: year, placeholder: 'e.g. 2026-27' },
          { name: 'transfer_date', label: 'Transfer Date', type: 'date', required: true, defaultValue: today },
          { name: 'reason', label: 'Reason', type: 'textarea', required: true, placeholder: 'e.g. Moved closer to the study hall' },
        ],
      };
    case 'transferRequest':
      return {
        title: 'Request Transfer',
        submitLabel: 'Submit Request',
        description: 'Ask for a different room and bed. This is a request only; the resident is not moved.',
        withRoomBed: true,
        fields: [{ name: 'reason', label: 'Reason', type: 'textarea', required: true, placeholder: 'e.g. Roommate conflict' }],
      };
    case 'vacate':
      return {
        title: 'Vacate Room',
        submitLabel: 'Vacate',
        description: 'End the resident’s current room allotment.',
        fields: [
          { name: 'vacate_date', label: 'Vacate Date', type: 'date', required: true, defaultValue: today },
          { name: 'reason', label: 'Reason', type: 'textarea', required: true, placeholder: 'e.g. Left the school' },
        ],
      };
  }
}

const SUCCESS_MESSAGES: Record<ModalKind, string> = {
  suspend: 'Resident suspended',
  reinstate: 'Resident reinstated',
  readmit: 'Resident readmitted',
  allot: 'Room allotted',
  transfer: 'Resident transferred',
  transferRequest: 'Transfer request submitted',
  vacate: 'Room vacated',
};

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-900 font-medium break-words">{value || '—'}</dd>
    </div>
  );
}

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('residents');
  const [resident, setResident] = useState<HostelResident | null>(null);
  // undefined: not loaded (or failed to load), null: no current allotment.
  const [allotment, setAllotment] = useState<RecordResult | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('allotment');
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([getResident(id), getResidentAllotment(id).catch(() => undefined)])
      .then(([loadedResident, loadedAllotment]) => {
        if (cancelled) return;
        setResident(loadedResident);
        setAllotment(loadedAllotment);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load resident'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadAllotmentHistory = useCallback((params: ListParams) => getResidentAllotmentHistory(id!, params), [id]);
  const loadTransferHistory = useCallback((params: ListParams) => getResidentTransferHistory(id!, params), [id]);
  const loadGatePasses = useCallback((params: ListParams) => getResidentGatePasses(id!, params), [id]);
  const loadAttendance = useCallback((params: ListParams) => getResidentAttendance(id!, params), [id]);
  const loadVisitors = useCallback((params: ListParams) => getResidentVisitors(id!, params), [id]);
  const loadMeals = useCallback((params: ListParams) => getResidentMessAttendance(id!, params), [id]);
  const loadInvoices = useCallback((params: ListParams) => getResidentInvoices(id!, params), [id]);
  const loadPayments = useCallback((params: ListParams) => getResidentPayments(id!, params), [id]);
  const loadDiscipline = useCallback((params: ListParams) => getResidentDisciplineRecords(id!, params), [id]);

  const submitModal = async (values: ActionValues) => {
    if (!id || !modal) return;
    const roomId = Number(values.room_id);
    const bedId = Number(values.bed_id);
    switch (modal) {
      case 'suspend':
        await suspendResident(id, values.reason);
        break;
      case 'reinstate':
        await reinstateResident(id, values.remarks);
        break;
      case 'readmit':
        await readmitResident(id, values.admitted_on);
        break;
      case 'allot':
        await allotResident(id, {
          room_id: roomId,
          bed_id: bedId,
          academic_year: values.academic_year.trim(),
          allotment_date: values.allotment_date,
        });
        break;
      case 'transfer':
        await transferResident(id, {
          room_id: roomId,
          bed_id: bedId,
          academic_year: values.academic_year.trim(),
          transfer_date: values.transfer_date,
          reason: values.reason,
        });
        break;
      case 'transferRequest':
        await requestResidentTransfer(id, {
          requested_room_id: roomId,
          requested_bed_id: bedId,
          reason: values.reason,
        });
        break;
      case 'vacate':
        await vacateResident(id, { vacate_date: values.vacate_date, reason: values.reason });
        break;
    }

    toast.success(SUCCESS_MESSAGES[modal]);
    setModal(null);
    // Status and allotment both change after these actions, so reload them.
    const [freshResident, freshAllotment] = await Promise.all([
      getResident(id),
      getResidentAllotment(id).catch(() => undefined),
    ]);
    setResident(freshResident);
    setAllotment(freshAllotment);
    setHistoryKey((key) => key + 1);
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!resident || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = statusActions(resident);
  const allotmentLoaded = allotment !== undefined;
  const hasAllotment = allotmentLoaded && hasRecordData(allotment?.data);
  const canTransfer = can('transfer', 'allotments');

  const actions: { kind: ModalKind; label: string; icon: typeof BedDouble; show: boolean }[] = [
    { kind: 'suspend', label: 'Suspend', icon: ShieldOff, show: status.suspend && can('suspend') },
    { kind: 'reinstate', label: 'Reinstate', icon: RotateCcw, show: status.reinstate && (can('reinstate') || can('suspend')) },
    { kind: 'readmit', label: 'Readmit', icon: UserPlus, show: status.readmit && (can('readmit') || can('update')) },
    { kind: 'allot', label: 'Allot Room', icon: BedDouble, show: allotmentLoaded && !hasAllotment && can('create', 'allotments') },
    { kind: 'transfer', label: 'Transfer', icon: ArrowRightLeft, show: hasAllotment && canTransfer },
    { kind: 'transferRequest', label: 'Request Transfer', icon: Send, show: hasAllotment && (canTransfer || can('request', 'allotments')) },
    { kind: 'vacate', label: 'Vacate', icon: LogOut, show: hasAllotment && can('vacate', 'allotments') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/residents" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to residents
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{resident.student_name}</h1>
            <ResidentStatusBadge resident={resident} />
          </div>
          <div className="flex flex-wrap gap-2">
            {can('update') && (
              <Link to={`/hostel/residents/${resident.resident_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {actions
              .filter((action) => action.show)
              .map(({ kind, label, icon: Icon }) => (
                <Button key={kind} variant="secondary" onClick={() => setModal(kind)}>
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              ))}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <Detail label="Admission No" value={resident.admission_no} />
          <Detail label="Student Reference" value={resident.student_ref} />
          <Detail label="Grade" value={resident.grade} />
          <Detail label="Gender" value={resident.gender} />
          <Detail label="Admitted On" value={resident.admitted_on ? formatValue('admitted_on', resident.admitted_on) : null} />
          <Detail label="Guardian" value={resident.guardian_name} />
          <Detail label="Guardian Phone" value={resident.guardian_phone} />
          <Detail label="Guardian Email" value={resident.guardian_email} />
        </dl>
      </Card>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'allotment' &&
          (!allotmentLoaded ? (
            <div className="p-8 text-center text-slate-500">Current allotment could not be loaded</div>
          ) : (
            <GenericDataView
              data={hasAllotment && allotment ? allotment.data : {}}
              emptyMessage="No room is currently allotted to this resident"
            />
          ))}
        {tab === 'allotment-history' && (
          <RecordPanel
            key={`allotment-history-${historyKey}`}
            load={loadAllotmentHistory}
            emptyMessage="No allotment history yet"
          />
        )}
        {tab === 'transfer-history' && (
          <RecordPanel
            key={`transfer-history-${historyKey}`}
            load={loadTransferHistory}
            emptyMessage="No transfers or transfer requests yet"
          />
        )}
        {tab === 'gate-passes' && (
          <>
            {can('create', 'gate_passes') && (
              <div className="flex justify-end p-4 border-b border-slate-200">
                <Link to={`/hostel/gate-passes/new?resident_id=${resident.resident_id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Gate Pass
                  </Button>
                </Link>
              </div>
            )}
            <RecordPanel
              key="gate-passes"
              load={loadGatePasses}
              emptyMessage="No gate passes for this resident"
              rowHref={gatePassHref}
            />
          </>
        )}
        {tab === 'attendance' && (
          <>
            {can('mark', 'attendance') && (
              <div className="flex justify-end p-4 border-b border-slate-200">
                <Link to={`/hostel/attendance/new?resident_id=${resident.resident_id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                </Link>
              </div>
            )}
            <RecordPanel
              key="attendance"
              load={loadAttendance}
              emptyMessage="No attendance recorded for this resident"
              rowHref={attendanceHref}
            />
          </>
        )}
        {tab === 'invoices' && (
          <>
            {can('create', 'invoices') && (
              <div className="flex justify-end p-4 border-b border-slate-200">
                <Link to={`/hostel/invoices/new?resident_id=${resident.resident_id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </Link>
              </div>
            )}
            <RecordPanel
              key="invoices"
              load={loadInvoices}
              emptyMessage="No invoices raised for this resident"
              rowHref={invoiceHref}
            />
          </>
        )}
        {tab === 'payments' && (
          <RecordPanel
            key="payments"
            load={loadPayments}
            emptyMessage="No payments recorded for this resident"
            rowHref={paymentHref}
          />
        )}
        {tab === 'discipline' && (
          <>
            {can('create', 'discipline_records') && (
              <div className="flex justify-end p-4 border-b border-slate-200">
                <Link to={`/hostel/discipline/new?resident_id=${resident.resident_id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Incident
                  </Button>
                </Link>
              </div>
            )}
            <RecordPanel
              key="discipline"
              load={loadDiscipline}
              emptyMessage="No discipline records for this resident"
              rowHref={disciplineHref}
            />
          </>
        )}
        {tab === 'meals' && (
          <>
            {(can('mark', 'mess_attendance') || can('create', 'mess_attendance')) && (
              <div className="flex justify-end p-4 border-b border-slate-200">
                <Link to={`/hostel/mess-attendance/new?resident_id=${resident.resident_id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Mark Meal
                  </Button>
                </Link>
              </div>
            )}
            <RecordPanel
              key="meals"
              load={loadMeals}
              emptyMessage="No meal attendance recorded for this resident"
            />
          </>
        )}
        {tab === 'visitors' && (
          <>
            {can('create', 'visitors') && (
              <div className="flex justify-end p-4 border-b border-slate-200">
                <Link to={`/hostel/visitors/new?resident_id=${resident.resident_id}`}>
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Visitor
                  </Button>
                </Link>
              </div>
            )}
            <RecordPanel
              key="visitors"
              load={loadVisitors}
              emptyMessage="No visitors have come to see this resident"
              rowHref={visitorHref}
            />
          </>
        )}
      </Card>

      {modal && (
        <ActionModal
          isOpen
          onClose={() => setModal(null)}
          onSubmit={submitModal}
          {...modalConfig(modal)}
        />
      )}
    </div>
  );
}

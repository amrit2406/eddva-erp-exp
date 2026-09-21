import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Check, LogIn, LogOut, X } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import ActionModal, { type ActionField, type ActionValues } from '../../components/residents/ActionModal';
import {
  approveGatePass,
  cancelGatePass,
  getGatePass,
  rejectGatePass,
  scanGatePass,
} from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { flattenRecord } from '../../utils/format';
import { gatePassActions } from '../../utils/gatePasses';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

type ModalKind = 'approve' | 'reject' | 'cancel' | 'scanOut' | 'scanIn';

const SUCCESS_MESSAGES: Record<ModalKind, string> = {
  approve: 'Gate pass approved',
  reject: 'Gate pass rejected',
  cancel: 'Gate pass cancelled',
  scanOut: 'Marked as out',
  scanIn: 'Marked as returned',
};

export default function GatePassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('gate_passes');
  const [pass, setPass] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getGatePass(id)
      .then((data) => {
        if (!cancelled) setPass(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load gate pass'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!pass || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const flat = flattenRecord(pass);
  const status = recordStatus(pass);
  const allowed = gatePassActions(status);
  const residentId = relatedId(pass, 'resident', 'resident_id');
  const admissionNo = String(flat.admission_no ?? flat.resident_admission_no ?? '');
  const passNo = typeof pass.pass_no === 'string' ? pass.pass_no : null;

  const canApprove = can('approve');
  const canScan = can('scan');

  // A scan confirms the resident; the pass's own resident is filled in but can be corrected.
  const scanFields: ActionField[] = [
    ...(residentId ? [] : [{ name: 'resident_id', label: 'Resident ID', type: 'text' as const, required: true }]),
    { name: 'admission_no', label: 'Admission No', type: 'text', required: true, defaultValue: admissionNo },
    { name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Optional note' },
  ];

  const modalProps: Record<ModalKind, { title: string; submitLabel: string; fields: ActionField[]; description?: string }> = {
    approve: {
      title: 'Approve Gate Pass',
      submitLabel: 'Approve',
      fields: [{ name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Optional note' }],
    },
    reject: {
      title: 'Reject Gate Pass',
      submitLabel: 'Reject',
      fields: [
        { name: 'remarks', label: 'Remarks', type: 'textarea', required: true, placeholder: 'e.g. Exam week — no outings' },
      ],
    },
    cancel: {
      title: 'Cancel Gate Pass',
      submitLabel: 'Cancel Pass',
      fields: [{ name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Optional note' }],
    },
    scanOut: {
      title: 'Scan Out',
      submitLabel: 'Mark as Out',
      description: 'Confirm the resident leaving the hostel with this pass.',
      fields: scanFields,
    },
    scanIn: {
      title: 'Scan In',
      submitLabel: 'Mark as Returned',
      description: 'Confirm the resident has returned to the hostel.',
      fields: scanFields,
    },
  };

  const submitModal = async (values: ActionValues) => {
    if (!id || !modal) return;
    const scanBody = {
      resident_id: Number(residentId ?? values.resident_id),
      admission_no: values.admission_no,
      remarks: values.remarks,
    };
    switch (modal) {
      case 'approve':
        await approveGatePass(id, values.remarks);
        break;
      case 'reject':
        await rejectGatePass(id, values.remarks);
        break;
      case 'cancel':
        await cancelGatePass(id, values.remarks);
        break;
      case 'scanOut':
        await scanGatePass(id, 'out', scanBody);
        break;
      case 'scanIn':
        await scanGatePass(id, 'in', scanBody);
        break;
    }
    toast.success(SUCCESS_MESSAGES[modal]);
    setModal(null);
    setPass(await getGatePass(id));
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/gate-passes" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to gate passes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{passNo ?? `Gate Pass #${id}`}</h1>
              <RecordStatusBadge status={status} />
            </div>
            {residentId && (
              <Link to={`/hostel/residents/${residentId}`} className="inline-block mt-2 text-sm text-[#008BE9] hover:underline">
                View resident
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {allowed.approve && canApprove && (
              <Button variant="primary" onClick={() => setModal('approve')}>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {allowed.reject && (can('reject') || canApprove) && (
              <Button variant="secondary" onClick={() => setModal('reject')}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            {allowed.scanOut && canScan && (
              <Button variant="primary" onClick={() => setModal('scanOut')}>
                <LogOut className="h-4 w-4 mr-2" />
                Scan Out
              </Button>
            )}
            {allowed.scanIn && canScan && (
              <Button variant="primary" onClick={() => setModal('scanIn')}>
                <LogIn className="h-4 w-4 mr-2" />
                Scan In
              </Button>
            )}
            {allowed.cancel && (can('cancel') || canApprove) && (
              <Button variant="ghost" onClick={() => setModal('cancel')}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Cancel Pass
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={pass} emptyMessage="No details available" />
      </Card>

      {modal && <ActionModal isOpen onClose={() => setModal(null)} onSubmit={submitModal} {...modalProps[modal]} />}
    </div>
  );
}

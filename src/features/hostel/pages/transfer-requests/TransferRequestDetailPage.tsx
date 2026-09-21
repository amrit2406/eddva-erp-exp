import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Ban } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import ActionModal, { type ActionValues } from '../../components/residents/ActionModal';
import {
  approveTransferRequest,
  cancelTransferRequest,
  getTransferRequest,
  rejectTransferRequest,
} from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

type ModalKind = 'approve' | 'reject';

export default function TransferRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('transfer_requests');
  const [request, setRequest] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getTransferRequest(id)
      .then((data) => {
        if (!cancelled) setRequest(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load transfer request'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const reload = async () => {
    if (id) setRequest(await getTransferRequest(id));
  };

  const submitModal = async (values: ActionValues) => {
    if (!id || !modal) return;
    if (modal === 'approve') {
      await approveTransferRequest(id, Number(values.bed_id), values.remarks);
      toast.success('Transfer request approved');
    } else {
      await rejectTransferRequest(id, values.remarks);
      toast.success('Transfer request rejected');
    }
    setModal(null);
    await reload();
  };

  const handleCancel = async () => {
    if (!id || !window.confirm('Cancel this transfer request?')) return;
    try {
      await cancelTransferRequest(id);
      toast.success('Transfer request cancelled');
      await reload();
    } catch (err) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to cancel transfer request'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!request || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = recordStatus(request);
  // Only pending requests can be processed; an unknown status lets the backend decide.
  const isOpen = status === null || status === 'pending';
  const canProcess = (action: string) => can(action) || can('transfer', 'allotments');
  const residentId = relatedId(request, 'resident', 'resident_id');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/hostel/transfer-requests"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to transfer requests
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Transfer Request #{id}</h1>
              <RecordStatusBadge status={status} />
            </div>
            {residentId && (
              <Link to={`/hostel/residents/${residentId}`} className="inline-block mt-2 text-sm text-[#008BE9] hover:underline">
                View resident
              </Link>
            )}
          </div>
          {isOpen && (
            <div className="flex flex-wrap gap-2">
              {canProcess('approve') && (
                <Button variant="primary" onClick={() => setModal('approve')}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {canProcess('reject') && (
                <Button variant="secondary" onClick={() => setModal('reject')}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
              {canProcess('cancel') && (
                <Button variant="ghost" onClick={handleCancel}>
                  <Ban className="h-4 w-4 mr-2 text-red-600" />
                  Cancel Request
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={request} emptyMessage="No details available" />
      </Card>

      {modal === 'approve' && (
        <ActionModal
          isOpen
          title="Approve Transfer"
          submitLabel="Approve"
          description="Confirm the bed the resident will be moved to. It defaults to the bed they asked for."
          bedPicker={{
            roomId: relatedId(request, 'requested_room', 'requested_room_id') ?? '',
            defaultBedId: relatedId(request, 'requested_bed', 'requested_bed_id'),
          }}
          fields={[{ name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Optional note' }]}
          onClose={() => setModal(null)}
          onSubmit={submitModal}
        />
      )}
      {modal === 'reject' && (
        <ActionModal
          isOpen
          title="Reject Transfer"
          submitLabel="Reject"
          fields={[
            {
              name: 'remarks',
              label: 'Remarks',
              type: 'textarea',
              required: true,
              placeholder: 'e.g. Requested room is reserved for senior students',
            },
          ]}
          onClose={() => setModal(null)}
          onSubmit={submitModal}
        />
      )}
    </div>
  );
}

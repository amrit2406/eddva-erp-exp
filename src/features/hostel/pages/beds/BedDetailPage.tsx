import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import BedNumberModal from '../../components/beds/BedNumberModal';
import BedStatusBadge from '../../components/beds/BedStatusBadge';
import GenericDataView from '../../components/common/GenericDataView';
import { deleteBed, getBed, updateBed } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { bedBlockLabel, bedRoomLabel } from '../../utils/beds';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { GenericRecord, HostelBed } from '../../types/hostel.types';

export default function BedDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('beds');
  const { blockName } = useBlockOptions();
  const [bed, setBed] = useState<HostelBed | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getBed(id)
      .then((data) => {
        if (!cancelled) setBed(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load bed'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleRename = async (bedNumber: string) => {
    if (!bed) return;
    await updateBed(bed.bed_id, bedNumber);
    setBed(await getBed(bed.bed_id));
    setRenameOpen(false);
    toast.success('Bed updated');
  };

  const handleDelete = async () => {
    if (!bed || !window.confirm(`Delete bed "${bed.bed_number}"?`)) return;
    try {
      await deleteBed(bed.bed_id);
      toast.success('Bed deleted');
      navigate('/hostel/beds');
    } catch (err) {
      // e.g. occupied beds or beds with allotment history can't be deleted
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete bed'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!bed) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/beds" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to beds
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Bed {bed.bed_number}</h1>
            <BedStatusBadge bed={bed} />
          </div>
          <div className="flex flex-wrap gap-2">
            {can('update') && (
              <Button variant="secondary" onClick={() => setRenameOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </Button>
            )}
            {can('delete') && (
              <Button variant="ghost" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Room</dt>
            <dd className="mt-1 font-medium">
              <Link to={`/hostel/rooms/${bed.room_id}`} className="text-slate-900 hover:text-[#008BE9]">
                {bedRoomLabel(bed)}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Block</dt>
            <dd className="mt-1 text-slate-900 font-medium">{bedBlockLabel(bed, blockName)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Updated</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {bed.updated_at ? new Date(bed.updated_at).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Details</h2>
        </div>
        <GenericDataView data={bed as unknown as GenericRecord} emptyMessage="No details available" />
      </Card>

      <BedNumberModal
        isOpen={renameOpen}
        title="Rename Bed"
        submitLabel="Save"
        initialValue={bed.bed_number}
        onClose={() => setRenameOpen(false)}
        onSubmit={handleRename}
      />
    </div>
  );
}

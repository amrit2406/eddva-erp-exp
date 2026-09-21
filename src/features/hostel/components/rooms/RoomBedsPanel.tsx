import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import BedNumberModal from '../beds/BedNumberModal';
import BedsTable from '../beds/BedsTable';
import PaginationBar from '../common/PaginationBar';
import { createRoomBed, deleteBed, getRoomBeds, updateBed } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelBed, Pagination } from '../../types/hostel.types';

interface RoomBedsPanelProps {
  roomId: string;
}

type ModalState = { mode: 'create' } | { mode: 'edit'; bed: HostelBed } | null;

const PAGE_SIZE = 20;

export default function RoomBedsPanel({ roomId }: RoomBedsPanelProps) {
  const { toast } = useToast();
  const { can } = useResourceAccess('beds');
  const [beds, setBeds] = useState<HostelBed[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    let cancelled = false;
    getRoomBeds(roomId, { page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setBeds(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to load beds'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, page, reloadKey]);

  const handleSubmit = async (bedNumber: string) => {
    if (modal?.mode === 'edit') {
      await updateBed(modal.bed.bed_id, bedNumber);
      toast.success('Bed updated');
    } else {
      await createRoomBed(roomId, bedNumber);
      toast.success('Bed added');
    }
    setModal(null);
    setReloadKey((key) => key + 1);
  };

  const handleDelete = async (bed: HostelBed) => {
    if (!window.confirm(`Delete bed "${bed.bed_number}"?`)) return;
    try {
      await deleteBed(bed.bed_id);
      toast.success('Bed deleted');
      if (beds.length === 1 && page > 1) setPage(page - 1);
      else setReloadKey((key) => key + 1);
    } catch (err) {
      // e.g. occupied beds or beds with allotment history can't be deleted
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete bed'));
    }
  };

  return (
    <>
      {can('create') && (
        <div className="flex justify-end p-4 border-b border-slate-200">
          <Button variant="primary" size="sm" onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bed
          </Button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : (
        <>
          <BedsTable
            beds={beds}
            showLocation={false}
            blockName={() => undefined}
            canUpdate={can('update')}
            canDelete={can('delete')}
            emptyMessage="No beds in this room yet"
            onEdit={(bed) => setModal({ mode: 'edit', bed })}
            onDelete={handleDelete}
          />
          {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
        </>
      )}

      <BedNumberModal
        isOpen={modal !== null}
        title={modal?.mode === 'edit' ? 'Rename Bed' : 'Add Bed'}
        submitLabel={modal?.mode === 'edit' ? 'Save' : 'Add Bed'}
        initialValue={modal?.mode === 'edit' ? modal.bed.bed_number : ''}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
      />
    </>
  );
}

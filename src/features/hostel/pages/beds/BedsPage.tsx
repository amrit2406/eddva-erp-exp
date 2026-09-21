import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import RecordPanel from '../../components/common/RecordPanel';
import BlockSelect from '../../components/blocks/BlockSelect';
import BedNumberModal from '../../components/beds/BedNumberModal';
import BedsTable from '../../components/beds/BedsTable';
import { deleteBed, getAvailableBeds, getBeds, getBedsOccupancy, getOccupiedBeds, updateBed } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelBed, ListParams, Pagination } from '../../types/hostel.types';

type View = 'all' | 'available' | 'occupied' | 'occupancy';

const VIEWS: { key: View; label: string }[] = [
  { key: 'all', label: 'All Beds' },
  { key: 'available', label: 'Available' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'occupancy', label: 'Occupancy' },
];

const PAGE_SIZE = 20;

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function BedsPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('beds');
  const { blocks, loaded, blockName } = useBlockOptions();
  const [view, setView] = useState<View>('all');
  const [blockId, setBlockId] = useState('');
  const [page, setPage] = useState(1);
  const [beds, setBeds] = useState<HostelBed[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<HostelBed | null>(null);

  useEffect(() => {
    if (view !== 'all') return;
    let cancelled = false;
    setLoading(true);
    getBeds({ page, limit: PAGE_SIZE, block_id: blockId })
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
  }, [view, page, blockId, reloadKey]);

  const loadAvailable = useCallback((params: ListParams) => getAvailableBeds({ ...params, block_id: blockId }), [blockId]);
  const loadOccupied = useCallback((params: ListParams) => getOccupiedBeds({ ...params, block_id: blockId }), [blockId]);
  const loadOccupancy = useCallback((params: ListParams) => getBedsOccupancy({ ...params, block_id: blockId }), [blockId]);

  const handleRename = async (bedNumber: string) => {
    if (!editing) return;
    await updateBed(editing.bed_id, bedNumber);
    toast.success('Bed updated');
    setEditing(null);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Beds</h1>
          <p className="text-slate-600 mt-1">Every bed across hostel rooms and who is using it</p>
        </div>
        {can('create') && (
          <Link to="/hostel/beds/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Bed
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => {
                setView(v.key);
                setPage(1);
              }}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                view === v.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-slate-200">
          <BlockSelect
            id="filter_block"
            value={blockId}
            onChange={(value) => {
              setBlockId(value);
              setPage(1);
            }}
            blocks={blocks}
            loaded={loaded}
            placeholder="All blocks"
            className={`${inputClass} w-full md:w-64`}
          />
        </div>

        {view === 'available' && (
          <RecordPanel key={`available-${blockId}`} load={loadAvailable} emptyMessage="No available beds" pageSize={PAGE_SIZE} />
        )}
        {view === 'occupied' && (
          <RecordPanel key={`occupied-${blockId}`} load={loadOccupied} emptyMessage="No occupied beds" pageSize={PAGE_SIZE} />
        )}
        {view === 'occupancy' && (
          <RecordPanel key={`occupancy-${blockId}`} load={loadOccupancy} emptyMessage="No occupancy data" pageSize={PAGE_SIZE} />
        )}

        {view === 'all' &&
          (loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              <BedsTable
                beds={beds}
                showLocation
                blockName={blockName}
                canUpdate={can('update')}
                canDelete={can('delete')}
                emptyMessage="No beds found"
                onEdit={setEditing}
                onDelete={handleDelete}
              />
              {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
            </>
          ))}
      </Card>

      <BedNumberModal
        isOpen={editing !== null}
        title="Rename Bed"
        submitLabel="Save"
        initialValue={editing?.bed_number ?? ''}
        onClose={() => setEditing(null)}
        onSubmit={handleRename}
      />
    </div>
  );
}

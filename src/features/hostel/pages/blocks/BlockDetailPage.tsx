import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, UserCheck } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import { ActiveBadge, GenderBadge } from '../../components/blocks/BlockBadges';
import RecordPanel from '../../components/common/RecordPanel';
import WardenSelect from '../../components/blocks/WardenSelect';
import {
  assignBlockWarden,
  deleteBlock,
  getBlock,
  getBlockOccupancy,
  getBlockResidents,
  getBlockRooms,
} from '../../api/hostel.api';
import type { ListParams } from '../../types/hostel.types';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelBlock } from '../../types/hostel.types';

type Tab = 'occupancy' | 'rooms' | 'residents';

const TABS: { key: Tab; label: string }[] = [
  { key: 'occupancy', label: 'Occupancy' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'residents', label: 'Residents' },
];

export default function BlockDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('blocks');
  const [block, setBlock] = useState<HostelBlock | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('occupancy');
  const [wardenModalOpen, setWardenModalOpen] = useState(false);
  const [wardenId, setWardenId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getBlock(id)
      .then((data) => {
        if (!cancelled) setBlock(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load block'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadOccupancy = useCallback(() => getBlockOccupancy(id!), [id]);
  const loadRooms = useCallback((params: ListParams) => getBlockRooms(id!, params), [id]);
  const loadResidents = useCallback((params: ListParams) => getBlockResidents(id!, params), [id]);

  const openWardenModal = () => {
    setWardenId(block?.warden_user_id ?? '');
    setAssignError(null);
    setWardenModalOpen(true);
  };

  const handleAssignWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!block || !wardenId) return;
    try {
      setAssigning(true);
      setAssignError(null);
      // The response may not echo the assigned warden's name, so refetch.
      await assignBlockWarden(block.block_id, wardenId);
      setBlock(await getBlock(block.block_id));
      setWardenModalOpen(false);
      toast.success('Warden assigned');
    } catch (err) {
      if (!isAuthError(err)) setAssignError(getApiErrorMessage(err, 'Failed to assign warden'));
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!block || !window.confirm(`Delete block "${block.name}"?`)) return;
    try {
      await deleteBlock(block.block_id);
      toast.success('Block deleted');
      navigate('/hostel/blocks');
    } catch (err) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete block'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!block) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/blocks" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to blocks
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{block.name}</h1>
              <GenderBadge gender={block.gender_type} />
              <ActiveBadge active={block.is_active} />
            </div>
            {block.description && <p className="text-slate-600 mt-1">{block.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {can('update') && (
              <Button variant="secondary" onClick={openWardenModal}>
                <UserCheck className="h-4 w-4 mr-2" />
                {block.warden_user_id ? 'Change Warden' : 'Assign Warden'}
              </Button>
            )}
            {can('update') && (
              <Link to={`/hostel/blocks/${block.block_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
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
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Floors</dt>
            <dd className="mt-1 text-slate-900 font-medium">{block.total_floors}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Warden</dt>
            <dd className="mt-1 text-slate-900 font-medium">{block.warden_name || block.warden_user_id || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {block.created_at ? new Date(block.created_at).toLocaleDateString() : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Updated</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {block.updated_at ? new Date(block.updated_at).toLocaleDateString() : '—'}
            </dd>
          </div>
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

        {tab === 'occupancy' && <RecordPanel key="occupancy" load={loadOccupancy} emptyMessage="No occupancy data" />}
        {tab === 'rooms' && <RecordPanel key="rooms" load={loadRooms} emptyMessage="No rooms found in this block" />}
        {tab === 'residents' && (
          <RecordPanel key="residents" load={loadResidents} emptyMessage="No residents found in this block" />
        )}
      </Card>

      <Modal
        isOpen={wardenModalOpen}
        onClose={() => !assigning && setWardenModalOpen(false)}
        title={block.warden_user_id ? 'Change Warden' : 'Assign Warden'}
      >
        <form onSubmit={handleAssignWarden} className="space-y-4">
          {assignError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {assignError}
            </div>
          )}
          <div>
            <label htmlFor="assign_warden" className="block text-sm font-medium text-slate-700 mb-1">
              Warden *
            </label>
            <WardenSelect id="assign_warden" value={wardenId} onChange={setWardenId} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setWardenModalOpen(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={assigning || !wardenId}>
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import { ActiveBadge, GenderBadge } from '../../components/blocks/BlockBadges';
import { deleteBlock, getBlocks } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelBlock } from '../../types/hostel.types';

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function BlocksPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('blocks');
  const [blocks, setBlocks] = useState<HostelBlock[]>([]);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBlocks()
      .then((data) => {
        if (cancelled) return;
        setBlocks(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to load blocks'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const genderOptions = useMemo(
    () => [...new Set(blocks.map((block) => block.gender_type).filter(Boolean))],
    [blocks]
  );

  const filteredBlocks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return blocks.filter((block) => {
      if (gender && block.gender_type !== gender) return false;
      if (status && String(block.is_active) !== status) return false;
      if (!query) return true;
      return (
        block.name.toLowerCase().includes(query) ||
        (block.warden_name ?? '').toLowerCase().includes(query) ||
        (block.warden_user_id ?? '').toLowerCase().includes(query)
      );
    });
  }, [blocks, search, gender, status]);

  const handleDelete = useCallback(
    async (block: HostelBlock) => {
      if (!window.confirm(`Delete block "${block.name}"?`)) return;
      try {
        await deleteBlock(block.block_id);
        toast.success('Block deleted');
        setReloadKey((key) => key + 1);
      } catch (err) {
        // e.g. blocks that still have rooms or residents can't be deleted
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete block'));
      }
    },
    [toast]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blocks</h1>
          <p className="text-slate-600 mt-1">Hostel buildings, their floors and wardens</p>
        </div>
        {can('create') && (
          <Link to="/hostel/blocks/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by block or warden..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
            <option value="">All genders</option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Block</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Gender</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Floors</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Warden</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No blocks found
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((block) => (
                    <tr key={block.block_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link
                          to={`/hostel/blocks/${block.block_id}`}
                          className="font-medium text-slate-900 hover:text-[#008BE9]"
                        >
                          {block.name}
                        </Link>
                        {block.description && (
                          <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{block.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <GenderBadge gender={block.gender_type} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">{block.total_floors}</td>
                      <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                        {block.warden_name || block.warden_user_id || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <ActiveBadge active={block.is_active} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/hostel/blocks/${block.block_id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {can('update') && (
                            <Link to={`/hostel/blocks/${block.block_id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {can('delete') && (
                            <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(block)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

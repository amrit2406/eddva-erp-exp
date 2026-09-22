import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import VerificationBadge from '../../components/profiles/VerificationBadge';
import { deleteProfile, exportProfiles, getProfiles } from '../../api/profiles.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniProfile, Pagination } from '../../types/profile.types';

const PAGE_SIZE = 20;
const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function ProfilesPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('alumni');
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProfiles({ page, limit: PAGE_SIZE, search: debouncedSearch, verification_status: status })
      .then((result) => {
        if (cancelled) return;
        setProfiles(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load profiles'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, reloadKey]);

  const handleDelete = useCallback(
    async (profile: AlumniProfile) => {
      if (!window.confirm(`Delete the profile for "${profile.full_name}"?`)) return;
      try {
        await deleteProfile(profile.profile_id);
        toast.success('Profile deleted');
        if (profiles.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err: any) {
        if (err?.response?.status !== 401) toast.error(getApiErrorMessage(err, 'Failed to delete profile'));
      }
    },
    [page, profiles.length, toast]
  );

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportProfiles({ search: debouncedSearch, verification_status: status });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export profiles'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Directory</h1>
          <p className="text-slate-600 mt-1">Alumni profiles, verification and portal accounts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can('read') && (
            <Button variant="secondary" onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          )}
          {can('create') && (
            <Link to="/alumni/profiles/new">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Batch</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">City</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No profiles found
                      </td>
                    </tr>
                  ) : (
                    profiles.map((profile) => (
                      <tr key={profile.profile_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/alumni/profiles/${profile.profile_id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {profile.full_name}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{profile.batch_year || '—'}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                          {profile.current_company || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">{profile.city || '—'}</td>
                        <td className="py-3 px-4">
                          <VerificationBadge status={profile.verification_status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/alumni/profiles/${profile.profile_id}`}>
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {can('update') && (
                              <Link to={`/alumni/profiles/${profile.profile_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {(can('delete') || can('update')) && (
                              <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(profile)}>
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
            {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}

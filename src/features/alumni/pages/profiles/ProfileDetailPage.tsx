import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, KeyRound, Pencil, RotateCcw, Trash2, X } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import RecordPanel from '../../components/common/RecordPanel';
import ProfileEmploymentPanel from '../../components/employment/ProfileEmploymentPanel';
import PhotoUploader from '../../components/profiles/PhotoUploader';
import VerificationBadge from '../../components/profiles/VerificationBadge';
import {
  deleteProfile,
  getPossibleDuplicates,
  getProfile,
  getProfileGroups,
  getVerificationHistory,
  issueProfileAccount,
  reactivateProfile,
  uploadProfilePhoto,
  verifyProfile,
} from '../../api/profiles.api';
import { getProfileDonationHistory } from '../../api/donations.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniProfile, ListParams } from '../../types/profile.types';

type Tab = 'employment' | 'history' | 'duplicates' | 'groups' | 'donations';
type ModalKind = 'reject' | 'account' | null;

const TABS: { key: Tab; label: string }[] = [
  { key: 'employment', label: 'Employment' },
  { key: 'history', label: 'Verification History' },
  { key: 'duplicates', label: 'Possible Duplicates' },
  { key: 'groups', label: 'Groups' },
  { key: 'donations', label: 'Donations' },
];

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function ProfileDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('alumni');
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('employment');
  const [modal, setModal] = useState<ModalKind>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setProfile(await getProfile(id));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProfile(id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load profile'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadHistory = useCallback((params: ListParams) => getVerificationHistory(id!, params), [id]);
  const loadDuplicates = useCallback(() => getPossibleDuplicates(id!), [id]);
  const loadGroups = useCallback(() => getProfileGroups(id!), [id]);
  const loadDonations = useCallback((params: ListParams) => getProfileDonationHistory(id!, params), [id]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      setActing(true);
      await verifyProfile(id);
      toast.success('Profile verified');
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to verify profile'));
    } finally {
      setActing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActing(true);
      setActionError(null);
      await verifyProfile(id, rejectReason);
      toast.success('Verification rejected');
      setModal(null);
      setRejectReason('');
      await reload();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to reject verification'));
    } finally {
      setActing(false);
    }
  };

  const handleReactivate = async () => {
    if (!id) return;
    try {
      setActing(true);
      await reactivateProfile(id);
      toast.success('Profile reactivated');
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reactivate profile'));
    } finally {
      setActing(false);
    }
  };

  const handleIssueAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActing(true);
      setActionError(null);
      await issueProfileAccount(id, accountPassword);
      toast.success('Portal account issued');
      setModal(null);
      setAccountPassword('');
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to issue portal account'));
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!profile || !window.confirm(`Delete the profile for "${profile.full_name}"?`)) return;
    try {
      await deleteProfile(profile.profile_id);
      toast.success('Profile deleted');
      navigate('/alumni/profiles');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete profile'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = profile.verification_status?.toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/profiles" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to directory
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
              <VerificationBadge status={profile.verification_status} />
            </div>
            <p className="text-slate-600 mt-1">{profile.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {status === 'pending' && can('verify') && (
              <>
                <Button variant="primary" onClick={handleApprove} disabled={acting}>
                  <Check className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button variant="secondary" onClick={() => setModal('reject')} disabled={acting}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {profile.is_active === false && (can('update') || can('verify')) && (
              <Button variant="secondary" onClick={handleReactivate} disabled={acting}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            )}
            {can('issue_account') && (
              <Button variant="secondary" onClick={() => setModal('account')}>
                <KeyRound className="h-4 w-4 mr-2" />
                Issue Account
              </Button>
            )}
            {can('update') && (
              <Link to={`/alumni/profiles/${profile.profile_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {(can('delete') || can('update')) && (
              <Button variant="ghost" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-4">
          <PhotoUploader
            currentPhotoUrl={profile.photo_url}
            onUpload={async (file) => {
              await uploadProfilePhoto(profile.profile_id, file);
              toast.success('Photo updated');
              await reload();
            }}
          />
        </div>
      </Card>

      <Card className="border-slate-200">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Batch / Graduation</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {profile.batch_year || '—'} / {profile.graduation_year || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Program</dt>
            <dd className="mt-1 text-slate-900 font-medium">{profile.program || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</dt>
            <dd className="mt-1 text-slate-900 font-medium">{profile.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Visibility</dt>
            <dd className="mt-1 text-slate-900 font-medium capitalize">{profile.visibility?.replace(/_/g, ' ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Company</dt>
            <dd className="mt-1 text-slate-900 font-medium">{profile.current_company || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Designation</dt>
            <dd className="mt-1 text-slate-900 font-medium">{profile.current_designation || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {[profile.city, profile.country].filter(Boolean).join(', ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">LinkedIn</dt>
            <dd className="mt-1 text-slate-900 font-medium truncate">
              {profile.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {profile.linkedin_url}
                </a>
              ) : (
                '—'
              )}
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
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'employment' && <ProfileEmploymentPanel alumniId={id!} canEdit={can('update')} />}
        {tab === 'history' && (
          <RecordPanel key="history" load={loadHistory} emptyMessage="No verification history yet" />
        )}
        {tab === 'duplicates' && (
          <RecordPanel key="duplicates" load={loadDuplicates} emptyMessage="No possible duplicates found" />
        )}
        {tab === 'groups' && <RecordPanel key="groups" load={loadGroups} emptyMessage="Not a member of any group" />}
        {tab === 'donations' && (
          <RecordPanel key="donations" load={loadDonations} emptyMessage="No donations from this alumnus yet" />
        )}
      </Card>

      <Modal isOpen={modal === 'reject'} onClose={() => !acting && setModal(null)} title="Reject Verification">
        <form onSubmit={handleReject} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
          )}
          <div>
            <label htmlFor="reject_reason" className="block text-sm font-medium text-slate-700 mb-1">
              Reason *
            </label>
            <textarea
              id="reject_reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Could not match this batch in school records"
              className={inputClass}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} disabled={acting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={acting}>
              {acting ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'account'} onClose={() => !acting && setModal(null)} title="Issue Portal Account">
        <form onSubmit={handleIssueAccount} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
          )}
          <div>
            <label htmlFor="account_password" className="block text-sm font-medium text-slate-700 mb-1">
              Temporary Password *
            </label>
            <input
              id="account_password"
              type="password"
              value={accountPassword}
              onChange={(e) => setAccountPassword(e.target.value)}
              placeholder="Temp#Pass2026"
              className={inputClass}
              required
              minLength={8}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} disabled={acting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={acting}>
              {acting ? 'Issuing...' : 'Issue Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

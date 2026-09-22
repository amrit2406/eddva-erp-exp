import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2, UserMinus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../../components/common/GenericDataView';
import AlumniPicker from '../../components/profiles/AlumniPicker';
import { addGroupMembers, deleteGroup, getGroup, getGroupMembers, removeGroupMember } from '../../api/groups.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { recordId } from '../../utils/records';
import type { AlumniProfile, GenericRecord } from '../../types/profile.types';
import type { AlumniGroup } from '../../types/engagement.types';

export default function GroupDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('groups');
  const [group, setGroup] = useState<AlumniGroup | null>(null);
  const [members, setMembers] = useState<GenericRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [picked, setPicked] = useState<AlumniProfile[]>([]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    const [groupData, membersResult] = await Promise.all([getGroup(id), getGroupMembers(id)]);
    setGroup(groupData);
    setMembers(Array.isArray(membersResult.data) ? membersResult.data : []);
  };

  useEffect(() => {
    load().catch((err) => {
      if (err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load group'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const memberIds = (members ?? []).map((member) => Number(recordId(member, 'alumni_id', 'profile_id')));

  const handleAddMembers = async () => {
    if (!id || picked.length === 0) return;
    try {
      setAdding(true);
      setAddError(null);
      await addGroupMembers(id, picked.map((profile) => profile.profile_id));
      toast.success(`Added ${picked.length} member(s)`);
      setAddOpen(false);
      setPicked([]);
      await load();
    } catch (err) {
      setAddError(getApiErrorMessage(err, 'Failed to add members'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (member: GenericRecord) => {
    if (!id) return;
    const memberId = recordId(member, 'alumni_id', 'profile_id');
    if (!memberId) return;
    const name = String(member.full_name ?? member.name ?? `#${memberId}`);
    if (!window.confirm(`Remove "${name}" from this group?`)) return;
    try {
      await removeGroupMember(id, memberId);
      toast.success('Member removed');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove member'));
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !window.confirm(`Delete group "${group.name}"?`)) return;
    try {
      await deleteGroup(group.group_id);
      toast.success('Group deleted');
      navigate('/alumni/groups');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete group'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/groups" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to groups
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
            <p className="text-slate-600 mt-1 capitalize">{group.group_type}</p>
            {group.description && <p className="text-slate-600 mt-1">{group.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {can('update') && (
              <Link to={`/alumni/groups/${group.group_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {(can('delete') || can('update')) && (
              <Button variant="ghost" onClick={handleDeleteGroup}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Members{members ? ` (${members.length})` : ''}</h2>
          {can('update') && (
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Members
            </Button>
          )}
        </div>

        {!members ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No members in this group yet</div>
        ) : (
          <GenericDataView data={members} emptyMessage="No members" />
        )}

        {can('update') && members && members.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex flex-wrap gap-2">
            {members.map((member) => {
              const memberId = recordId(member, 'alumni_id', 'profile_id');
              const name = String(member.full_name ?? member.name ?? `#${memberId}`);
              return (
                <button
                  key={memberId}
                  type="button"
                  onClick={() => handleRemoveMember(member)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700"
                  title="Remove from group"
                >
                  <UserMinus className="h-3 w-3" />
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Modal isOpen={addOpen} onClose={() => !adding && setAddOpen(false)} title="Add Members" size="lg">
        <div className="space-y-4">
          {addError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{addError}</div>
          )}
          <AlumniPicker
            id="add_member"
            selected={null}
            exclude={[...memberIds, ...picked.map((p) => p.profile_id)]}
            onSelect={(profile) => {
              if (profile) setPicked((prev) => [...prev, profile]);
            }}
          />
          {picked.length > 0 && (
            <ul className="space-y-2">
              {picked.map((profile) => (
                <li
                  key={profile.profile_id}
                  className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <span className="text-sm text-slate-900">{profile.full_name}</span>
                  <button
                    type="button"
                    onClick={() => setPicked((prev) => prev.filter((p) => p.profile_id !== profile.profile_id))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} disabled={adding}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleAddMembers} disabled={adding || picked.length === 0}>
              {adding ? 'Adding...' : `Add ${picked.length || ''} Member(s)`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import GroupForm from '../../components/groups/GroupForm';
import { getGroup, updateGroup } from '../../api/groups.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { GroupFormData } from '../../types/engagement.types';

export default function EditGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('groups');
  const [initial, setInitial] = useState<GroupFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getGroup(id)
      .then((group) => {
        if (!cancelled) setInitial({ name: group.name, group_type: group.group_type, description: group.description ?? '' });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load group'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: GroupFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateGroup(id, data);
      toast.success('Group updated');
      navigate(`/alumni/groups/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update group'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Group</h1>
        <p className="text-slate-600 mt-1">Update group details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice />
          ) : (
            <GroupForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Group"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/alumni/groups/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
